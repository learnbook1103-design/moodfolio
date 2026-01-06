// components/templates/moodColorMap.js

// 무드 태그에 따른 색상 테마 정의
const moodThemes = {
  "#차분한": {
    headerGradient: "from-slate-600 to-gray-800",
    textHighlight: "text-slate-700 dark:text-slate-300",
    accentRing: "ring-slate-500",
    pill: "border-slate-500 text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    glowColor: "#64748b", // slate-500 (darker)
    dot: "bg-slate-600"
  },
  "#열정적인": {
    headerGradient: "from-red-600 to-orange-600",
    textHighlight: "text-red-700 dark:text-red-400",
    accentRing: "ring-red-500",
    pill: "border-red-500 text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300",
    glowColor: "#dc2626", // red-600 (stronger)
    dot: "bg-red-600"
  },
  "#신뢰감있는": {
    headerGradient: "from-blue-700 to-cyan-600",
    textHighlight: "text-blue-700 dark:text-blue-400",
    accentRing: "ring-blue-500",
    pill: "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300",
    glowColor: "#2563eb", // blue-600 (stronger)
    dot: "bg-blue-600"
  },
  "#힙한(Hip)": {
    headerGradient: "from-purple-600 to-pink-600",
    textHighlight: "text-purple-700 dark:text-purple-400",
    accentRing: "ring-purple-500",
    pill: "border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300",
    glowColor: "#9333ea", // purple-600 (stronger)
    dot: "bg-purple-600"
  },
  "#창의적인": {
    headerGradient: "from-yellow-500 to-orange-500",
    textHighlight: "text-orange-700 dark:text-yellow-400",
    accentRing: "ring-yellow-500",
    pill: "border-yellow-500 text-orange-700 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-300",
    glowColor: "#f59e0b", // amber-500 (stronger)
    dot: "bg-yellow-600"
  },
  "#미니멀한": {
    headerGradient: "from-gray-400 to-gray-600",
    textHighlight: "text-gray-800 dark:text-gray-200",
    accentRing: "ring-gray-400",
    pill: "border-gray-400 text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300",
    glowColor: "#9ca3af", // gray-400
    dot: "bg-gray-500"
  },
  "#클래식한": {
    headerGradient: "from-amber-800 to-amber-900",
    textHighlight: "text-amber-900 dark:text-amber-200",
    accentRing: "ring-amber-700",
    pill: "border-amber-700 text-amber-900 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-200",
    glowColor: "#b45309", // amber-700 (stronger)
    dot: "bg-amber-800"
  }
};

// 기본 스타일 (매칭되는 게 없을 때)
const defaultStyle = moodThemes["#신뢰감있는"];

export function getStyleByMood(selectedMoods = []) {
  if (!selectedMoods || selectedMoods.length === 0) return defaultStyle;
  // 첫 번째 선택된 무드를 기준으로 스타일 반환 (필요시 로직 고도화 가능)
  return moodThemes[selectedMoods[0]] || defaultStyle;
}

// moodThemes도 export (다른 컴포넌트에서 사용 가능)
export { moodThemes };