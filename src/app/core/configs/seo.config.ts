export interface SeoConfig {
    title: string;
    description: string;
    image?: string;
    url?: string;
    keywords?: string;
}

export const SEO_CONFIG: Record<string, SeoConfig> = {
    '/': {
        title: 'Kindi - Nền tảng kết nối doanh nghiệp SME | Mua chung - Tìm nhà cung cấp',
        description: 'Kindi - Nền tảng kết nối doanh nghiệp SME tại Việt Nam. Cung cấp dịch vụ mua chung hàng hóa, tìm kiếm nhà cung cấp uy tín và phát triển kênh bán hàng cộng tác viên.',
        image: 'https://kindi.vn/assets/images/og-image.png',
        url: 'https://kindi.vn',
        keywords: 'kindi, nền tảng kết nối sme, mua chung, tìm nhà cung cấp, ctv bán hàng'
    },
    '/register': {
        title: 'Đăng ký đối tác Kindi - Trở thành cộng tác viên bán hàng',
        description: 'Đăng ký trở thành đối tác Kindi ngay hôm nay để bắt đầu nhận và chia sẻ các cơ hội kinh doanh phù hợp với mạng lưới của bạn.',
        image: 'https://kindi.vn/assets/images/og-image.png',
        url: 'https://kindi.vn/register',
        keywords: 'đăng ký đối tác, cộng tác viên bán hàng, kindi partner'
    },
    '/find-supplier': {
        title: 'Tìm nhà cung cấp uy tín - Kết nối nguồn hàng chất lượng',
        description: 'Tìm kiếm nhà cung cấp uy tín với giá tốt nhất trên nền tảng Kindi. Kết nối với hàng ngàn nhà cung cấp trong và ngoài nước.',
        image: 'https://kindi.vn/assets/images/og-image.png',
        url: 'https://kindi.vn/find-supplier',
        keywords: 'tìm nhà cung cấp, nguồn hàng, kết nối doanh nghiệp'
    },
    '/connect-sme': {
        title: 'Kết nối doanh nghiệp SME - Mở rộng mạng lưới kinh doanh',
        description: 'Kết nối với cộng đồng doanh nghiệp SME trên Kindi. Tìm kiếm đối tác, chia sẻ cơ hội và phát triển cùng nhau.',
        image: 'https://kindi.vn/assets/images/og-image.png',
        url: 'https://kindi.vn/connect-sme',
        keywords: 'kết nối doanh nghiệp, sme, mạng lưới kinh doanh'
    },
    '/partner': {
        title: 'Đăng ký đối tác kinh doanh - Hợp tác cùng Kindi',
        description: 'Đăng ký trở thành đối tác kinh doanh của Kindi để nhận được nhiều ưu đãi và cơ hội hợp tác hấp dẫn.',
        image: 'https://kindi.vn/assets/images/og-image.png',
        url: 'https://kindi.vn/partner',
        keywords: 'đối tác kinh doanh, hợp tác, kindi partner'
    },
    '/login': {
        title: 'Đăng nhập Kindi - Truy cập hệ thống kết nối doanh nghiệp',
        description: 'Đăng nhập vào Kindi để kết nối với doanh nghiệp, quản lý yêu cầu và theo dõi cơ hội kinh doanh.',
        image: 'https://kindi.vn/assets/images/og-image.png',
        url: 'https://kindi.vn/login',
        keywords: 'đăng nhập, kindi, kết nối doanh nghiệp'
    },
    '/community': {
        title: 'Cộng đồng Kindi - Kết nối doanh nhân Việt Nam',
        description: 'Tham gia cộng đồng doanh nhân Kindi để chia sẻ kiến thức, tìm kiếm cơ hội và phát triển kinh doanh bền vững.',
        image: 'https://kindi.vn/assets/images/og-image.png',
        url: 'https://kindi.vn/community',
        keywords: 'cộng đồng doanh nhân, kết nối, chia sẻ kiến thức'
    }
};