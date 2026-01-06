// scripts/collect-data.mjs
// 간소화된 데이터 수집 스크립트 (Supabase 없이 로컬 저장)

import { JobScraper } from '../lib/scrapers/job-scraper.js';
import { DataCleaner } from '../lib/data-pipeline/cleaner.js';
import { writeFileSync } from 'fs';

async function main() {
    const scraper = new JobScraper();
    const cleaner = new DataCleaner();

    const jobTypes = ['developer', 'designer', 'marketer', 'service'];
    const allData = {};

    console.log('🚀 Starting comprehensive job data collection...\n');

    for (const jobType of jobTypes) {
        console.log(`\n📋 Processing ${jobType}...`);

        let allJobs = [];

        // 원티드에서 수집
        console.log(`  Scraping from Wanted...`);
        try {
            const wantedJobs = await scraper.scrapeWanted(jobType, 25);
            allJobs.push(...wantedJobs);
            console.log(`  ✅ Collected ${wantedJobs.length} jobs from Wanted`);
        } catch (error) {
            console.error(`  ⚠️ Wanted error:`, error.message);
        }

        // 사람인에서 수집
        console.log(`  Scraping from Saramin...`);
        try {
            const saraminJobs = await scraper.scrapeSaramin(jobType, 25);
            allJobs.push(...saraminJobs);
            console.log(`  ✅ Collected ${saraminJobs.length} jobs from Saramin`);
        } catch (error) {
            console.error(`  ⚠️ Saramin error:`, error.message);
        }

        // 데이터 정제
        console.log(`  Cleaning ${allJobs.length} jobs...`);
        const cleanedJobs = allJobs.map(job => cleaner.cleanJobPosting(job));
        const uniqueJobs = cleaner.deduplicateJobs(cleanedJobs);
        const validJobs = uniqueJobs.filter(job => cleaner.validateJobPosting(job).isValid);

        console.log(`  Valid jobs: ${validJobs.length}`);

        // 인사이트 집계
        const skillCounts = {};
        const keywordCounts = {};

        validJobs.forEach(job => {
            // 기술 집계
            [...(job.required_skills || []), ...(job.preferred_skills || [])].forEach(skill => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });

            // 키워드 집계
            (job.keywords || []).forEach(keyword => {
                keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
            });
        });

        const topSkills = Object.entries(skillCounts)
            .map(([skill, count]) => ({
                skill,
                count,
                rate: (count / validJobs.length * 100).toFixed(1) + '%',
                importance: count > validJobs.length * 0.5 ? 'critical' :
                    count > validJobs.length * 0.3 ? 'high' : 'medium'
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 30);

        const topKeywords = Object.entries(keywordCounts)
            .map(([keyword, count]) => ({
                keyword,
                count,
                frequency: (count / validJobs.length * 100).toFixed(1) + '%'
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 50);

        allData[jobType] = {
            jobs: validJobs,
            insights: {
                topSkills,
                topKeywords,
                sampleSize: validJobs.length,
                lastUpdated: new Date().toISOString()
            }
        };

        console.log(`  ✅ Completed ${jobType}: ${validJobs.length} jobs, ${topSkills.length} skills\n`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 결과 저장
    console.log('\n💾 Saving results...');

    // JSON 파일로 저장
    writeFileSync(
        'rag-data.json',
        JSON.stringify(allData, null, 2),
        'utf-8'
    );

    // 인사이트만 따로 저장
    const insights = {};
    Object.keys(allData).forEach(jobType => {
        insights[jobType] = allData[jobType].insights;
    });

    writeFileSync(
        'market-insights.json',
        JSON.stringify(insights, null, 2),
        'utf-8'
    );

    console.log('✅ Saved to rag-data.json and market-insights.json\n');

    // 요약 출력
    console.log('🎉 Collection Summary:\n');
    Object.entries(allData).forEach(([jobType, data]) => {
        console.log(`  ${jobType}:`);
        console.log(`    Jobs: ${data.insights.sampleSize}`);
        console.log(`    Top 5 Skills: ${data.insights.topSkills.slice(0, 5).map(s => `${s.skill} (${s.rate})`).join(', ')}`);
        console.log();
    });

    console.log('💡 Next step: Use market-insights.json in your API');
}

main().catch(console.error);
