import ErrorLayout from '../components/ErrorLayout';

export default function Custom500() {
    return (
        <ErrorLayout
            errorCode="500"
            title="서버 오류가 발생했습니다"
            message="일시적인 서버 문제가 발생했습니다. 잠시 후 다시 시도해주시거나 페이지를 새로고침해주세요. 문제가 지속되면 관리자에게 문의해주세요."
            showRefresh={true}
            accentColor="red"
        />
    );
}
