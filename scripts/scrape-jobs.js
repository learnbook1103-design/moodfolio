// scripts/scrape-jobs.js
// 채용공고 수집 스크립트

import { JobScraper } from '../lib/scrapers/job-scraper.js';
import { DataCleaner } from '../lib/data-pipeline/cleaner.js';
import { DataAggregator } from '../lib/data-pipeline/aggregator.js';
import { supabase } from '../lib/supabase.js';

async function main() {
    const scraper = new JobScraper();
    const cleaner = new DataCleaner();
    const aggregator = new DataAggregator();

    const jobTypes = ['developer', 'designer', 'marketer', 'service'];
    const targetPerSource = 25; // 각 소스에서 25개씩 = 총 50개

    console.log('🚀 Starting job scraping...\n');

    for (const jobType of jobTypes) {
        console.log(`\n📋 Processing ${jobType}...`);

        let allJobs = [];

        // 1. 원티드에서 수집
        console.log(`  Scraping from Wanted...`);
        const wantedJobs = await scraper.scrapeWanted(jobType, targetPerSource);
        allJobs.push(...wantedJobs);

        // 2. 사람인에서 수집
        console.log(`  Scraping from Saramin...`);
        const saraminJobs = await scraper.scrapeSaramin(jobType, targetPerSource);
        allJobs.push(...saraminJobs);

        // 3. 데이터 정제
        console.log(`  Cleaning ${allJobs.length} jobs...`);
        const cleanedJobs = allJobs.map(job => cleaner.cleanJobPosting(job));

        // 4. 중복 제거
        const uniqueJobs = cleaner.deduplicateJobs(cleanedJobs);
        console.log(`  After deduplication: ${uniqueJobs.length} jobs`);

        // 5. 유효성 검증
        const validJobs = uniqueJobs.filter(job => {
            const validation = cleaner.validateJobPosting(job);
            if (!validation.isValid) {
                console.log(`  ⚠️ Invalid job: ${validation.errors.join(', ')}`);
            }
            return validation.isValid;
        });

        console.log(`  Valid jobs: ${validJobs.length}`);

        // 6. Supabase에 저장
        if (validJobs.length > 0) {
            const { data, error } = await supabase
                .from('job_postings')
                .upsert(validJobs, {
                    onConflict: 'job_id',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error(`  ❌ Error saving to Supabase:`, error);
            } else {
                console.log(`  ✅ Saved ${validJobs.length} jobs to database`);
            }
        }

        // 7. 인사이트 집계
        console.log(`  Aggregating insights...`);
        await aggregator.aggregateInsights(jobType);

        // 8. 트렌드 계산
        console.log(`  Calculating trends...`);
        await aggregator.calculateWeeklyTrends(jobType);

        console.log(`  ✅ Completed ${jobType}\n`);

        // Rate limiting between job types
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 All done! Summary:');

    // 최종 통계
    for (const jobType of jobTypes) {
        const { count } = await supabase
            .from('job_postings')
            .select('*', { count: 'exact', head: true })
            .eq('job_type', jobType);

        const { data: insights } = await supabase
            .from('market_insights_cache')
            .select('sample_size, data_quality_score')
            .eq('job_type', jobType)
            .single();

        console.log(`  ${jobType}: ${count} jobs, quality score: ${insights?.data_quality_score?.toFixed(2) || 'N/A'}`);
    }
}

// 실행
main().catch(console.error);
