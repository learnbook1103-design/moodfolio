import ErrorLayout from '../components/ErrorLayout';

export default function Custom404() {
    return (
        <ErrorLayout
            errorCode="404"
            title="페이지를 찾을 수 없습니다"
            message="요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. URL을 확인하시거나 메인 페이지로 돌아가주세요."
            accentColor="emerald"
        />
    );
}
