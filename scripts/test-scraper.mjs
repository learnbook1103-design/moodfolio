// scripts/test-scraper.mjs
// 스크래퍼 테스트 (Supabase 없이)

import { JobScraper } from '../lib/scrapers/job-scraper.js';
import { DataCleaner } from '../lib/data-pipeline/cleaner.js';

async function test() {
    console.log('🧪 Testing job scraper...\n');

    const scraper = new JobScraper();
    const cleaner = new DataCleaner();

    // 개발자 채용공고 5개만 테스트
    console.log('📋 Scraping developer jobs from Wanted...');

    try {
        const jobs = await scraper.scrapeWanted('developer', 5);
        console.log(`✅ Scraped ${jobs.length} jobs\n`);

        if (jobs.length > 0) {
            // 첫 번째 채용공고 출력
            const firstJob = jobs[0];
            console.log('📄 Sample Job:');
            console.log(`  Title: ${firstJob.job_title}`);
            console.log(`  Company: ${firstJob.company_name}`);
            console.log(`  Skills: ${firstJob.required_skills.join(', ')}`);
            console.log(`  Keywords: ${firstJob.keywords.join(', ')}`);
            console.log();

            // 데이터 정제 테스트
            const cleaned = cleaner.cleanJobPosting(firstJob);
            console.log('🧹 After cleaning:');
            console.log(`  Skills: ${cleaned.required_skills.join(', ')}`);
            console.log();

            // 기술 집계
            const skillCounts = {};
            jobs.forEach(job => {
                job.required_skills.forEach(skill => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
            });

            const topSkills = Object.entries(skillCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            console.log('📊 Top 10 Skills:');
            topSkills.forEach(([skill, count]) => {
                const percentage = (count / jobs.length * 100).toFixed(0);
                console.log(`  ${skill}: ${count}/${jobs.length} (${percentage}%)`);
            });
        }

        console.log('\n✅ Test completed successfully!');
        console.log('\n💡 Next step: Set up Supabase credentials and run full scraping');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

test();
