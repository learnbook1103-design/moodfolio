import React from 'react';
import { motion } from 'framer-motion';

/**
 * ProfileHeader - 포트폴리오 상단에 표시되는 공통 프로필 섹션
 * 프로필 사진, 이름, 소개, 연락처 정보를 표시합니다.
 * 
 * @param {object} userData - 사용자 데이터
 * @param {boolean} isEditing - 편집 모드 여부
 * @param {function} onEdit - 편집 버튼 클릭 핸들러
 * @param {object} customStyle - 템플릿별 커스텀 스타일 (선택)
 * @param {string} variant - 레이아웃 변형 ('default', 'compact', 'minimal')
 */
export default function ProfileHeader({
    userData,
    isEditing = false,
    onEdit,
    customStyle = {},
    variant = 'default'
}) {
    if (!userData) return null;

    const { profile_image, name, intro, email, phone, link } = userData;

    // 기본 스타일
    const defaultStyles = {
        container: 'w-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border-b border-white/10 py-8 px-6 mb-8',
        imageSize: 'w-24 h-24 md:w-32 md:h-32',
        imageBorder: 'border-4 border-white/20',
        nameText: 'text-3xl md:text-4xl font-bold text-white mb-2',
        introText: 'text-lg md:text-xl text-gray-300 mb-4 leading-relaxed',
        contactText: 'text-sm md:text-base text-gray-400',
        contactHover: 'hover:text-emerald-400'
    };

    // 변형별 스타일
    const variantStyles = {
        default: defaultStyles,
        compact: {
            ...defaultStyles,
            container: 'w-full bg-black/20 backdrop-blur-sm border-b border-white/5 py-6 px-4 mb-6',
            imageSize: 'w-20 h-20 md:w-24 md:h-24',
            nameText: 'text-2xl md:text-3xl font-bold text-white mb-1',
            introText: 'text-base md:text-lg text-gray-300 mb-3',
        },
        minimal: {
            ...defaultStyles,
            container: 'w-full py-6 px-4 mb-6',
            imageSize: 'w-16 h-16 md:w-20 md:h-20',
            imageBorder: 'border-2 border-white/10',
            nameText: 'text-xl md:text-2xl font-semibold text-white mb-1',
            introText: 'text-sm md:text-base text-gray-400 mb-2',
            contactText: 'text-xs md:text-sm text-gray-500',
        }
    };

    // 최종 스타일 (변형 + 커스텀)
    const styles = {
        ...variantStyles[variant],
        ...customStyle
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={styles.container}
            style={styles.containerBorderColor ? { borderColor: styles.containerBorderColor } : {}}
        >
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                    {profile_image ? (
                        <img
                            src={profile_image}
                            alt={name || 'Profile'}
                            className={`${styles.imageSize} rounded-full object-cover ${styles.imageBorder} shadow-xl`}
                        />
                    ) : (
                        <div className={`${styles.imageSize} rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ${styles.imageBorder} flex items-center justify-center text-5xl shadow-xl`}>
                            👤
                        </div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                    {/* Name */}
                    {name && (
                        <h1 className={styles.nameText}>
                            {name}
                        </h1>
                    )}

                    {/* Intro */}
                    {intro && (
                        <p className={styles.introText}>
                            {intro}
                        </p>
                    )}

                    {/* Contact Info */}
                    <div className={`flex flex-wrap items-center justify-center md:justify-start gap-4 ${styles.contactText}`}>
                        {email && (
                            <a
                                href={`mailto:${email}`}
                                className={`flex items-center gap-2 ${styles.contactHover} transition-colors`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span>📧</span>
                                <span>{email}</span>
                            </a>
                        )}

                        {phone && (
                            <a
                                href={`tel:${phone}`}
                                className={`flex items-center gap-2 ${styles.contactHover} transition-colors`}
                            >
                                <span>📱</span>
                                <span>{phone}</span>
                            </a>
                        )}

                        {link && (
                            <a
                                href={link.startsWith('http') ? link : `https://${link}`}
                                className={`flex items-center gap-2 ${styles.contactHover} transition-colors`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span>🔗</span>
                                <span className="truncate max-w-[200px]">
                                    {link.replace(/^https?:\/\//, '')}
                                </span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Edit Button (if in edit mode) */}
                {isEditing && onEdit && (
                    <button
                        onClick={onEdit}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg"
                    >
                        <span>✏️</span>
                        <span>편집</span>
                    </button>
                )}
            </div>
        </motion.div>
    );
}
