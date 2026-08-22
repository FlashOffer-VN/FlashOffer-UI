import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { SocialPost, SocialMember, SocialEvent, SocialGroup, SocialComment } from '../models/social.model';

@Injectable({
    providedIn: 'root'
})
export class SocialService {
    private posts: SocialPost[] = [
        {
            id: 1,
            author: {
                id: 1,
                name: 'Minh Nguyen',
                avatar: 'assets/avatars/avatar.jpg',
                username: 'minhnguyen',
                role: 'Founder tại SMEConnect',
                isVerified: true
            },
            title: 'KHÔNG AI THÀNH CÔNG MỘT MÌNH',
            content: `Chúng ta thích tôn thờ hình ảnh một thiên tài đơn độc, tự tay dựng nên đế chế tỷ đô từ một gara xe. Nhưng khi lật lại lời kể của chính những người trong cuộc, sự thật lại khác hẳn.

1. Bill Gates: "Không có Paul, sẽ không có Microsoft"
Khi Paul Allen - người bạn thân cùng sáng lập Microsoft - qua đời năm 2018, Bill Gates không nói những lời sáo rỗng thông thường. Ông viết:
"Without Paul's genius, without Paul's push, without Paul's insight, there's no Microsoft, just not a chance."

Gates là người giỏi kinh doanh và lập trình, nhưng chính Allen mới là người mang tầm nhìn về một chiếc máy tính cá nhân cho mọi nhà, và là người thúc Gates bỏ học Harvard để bắt tay làm ngay.

2. Steve Jobs và Steve Wozniak: Ai cũng cần một "Woz" của riêng mình
Steve Jobs nổi tiếng là bậc thầy thuyết phục và tầm nhìn sản phẩm. Nhưng trong mười năm đầu của Apple, sản phẩm duy nhất mang lại doanh thu thực sự - chiếc Apple II - là do một mình Steve Wozniak thiết kế gần như trọn vẹn. Wozniak từng nói thẳng: "Jobs couldn't have done it without me."

3. Elon Musk: Trận chiến tuyển người quan trọng nhất sự nghiệp
Khi được hỏi về thành công của OpenAI, Elon Musk không nhắc đến vốn đầu tư hay ý tưởng ban đầu. Ông nhắc đến một con người: Ilya Sutskever. Musk chia sẻ: "That was one of the toughest recruiting battles I've ever had, but that was really the linchpin for OpenAI being successful."

BÀI HỌC BẢN CHẤT:
Điểm chung của Gates, Jobs và Musk không phải là họ may mắn gặp đúng người. Đó là họ đủ tỉnh táo để nhận ra giới hạn của chính mình, và đủ khiêm tốn để công khai thừa nhận điều đó.

Một người có thể giỏi đến mức xuất chúng, nhưng không ai giỏi đều ở mọi mặt. Đi tìm người bù đắp cho phần mình còn thiếu không phải là dấu hiệu của sự yếu kém. Đó là điều kiện để đi được xa hơn giới hạn của một cá nhân.

Nếu bạn đang khởi nghiệp, câu hỏi không nên dừng ở "tôi có đủ giỏi để tự làm không". Câu hỏi cần đặt ra là: ai là "Paul Allen", ai là "Wozniak", ai là "Ilya Sutskever" của chính mình - và mình đã đủ can đảm để đi tìm và giữ chân người đó chưa.`,
            likes: 245,
            comments: 38,
            shares: 56,
            isLiked: false,
            isSaved: false,
            createdAt: new Date('2026-08-04T10:30:00'),
            tags: ['khởi_nghiệp', 'đồng_đội', 'lãnh_đạo'],
            type: 'post',
            privacy: 'public'
        },
        {
            id: 2,
            author: {
                id: 2,
                name: 'Chuyện Doanh Nhân',
                avatar: 'assets/avatars/avatar.jpg',
                username: 'chuyendoanhnhan',
                role: 'Trang thông tin doanh nghiệp',
                isVerified: false
            },
            title: 'Cú lừa ngọt ngào mang tên trả góp 0%',
            content: `NHÌN CÁCH "ÔNG TRÙM BÁN LẺ" CHƠI ĐÙA VỚI DÒNG TIỀN, 90% SẾP VIỆT MỚI NHẬN RA MÌNH ĐANG LÀM KINH DOANH NHƯ... CHƠI ĐỒ HÀNG!

Nhiều công ty nhỏ thường vỗ ngực tự hào: "Mình bán rẻ hơn Thế Giới Di Động, mình sát giá gốc hơn, khách hàng chắc chắn sẽ chọn mình!" Nhưng bạn ơi, sếp bán đắt hay bán rẻ để làm gì, khi mà khách hàng mua nợ, tiền lãi nằm hết trên sổ sách?

SỰ THẬT TÀN NHẪN VỀ TRÒ CHƠI TÀI CHÍNH CỦA NHỮNG ĐẾ CHẾ TỶ ĐÔ:
Trò chơi tinh vi nhất của những ông lớn không nằm ở tỷ suất lợi nhuận trên từng sản phẩm. Nó nằm ở năng lực "Mượn tiền thiên hạ" thông qua chiêu bài: TRẢ GÓP 0%.

Đó chính là lý do vì sao có những thời điểm, đế chế bán lẻ này thâu tóm và ôm trọn tới 24.000 TỶ ĐỒNG TIỀN MẶT gửi ngân hàng lấy lãi, trong khi các đối thủ nhỏ lẻ thì chết chìm trong công nợ.

HỌ ĐÃ LÀM ĐIỀU ĐÓ NHƯ THẾ NÀO?
Rất đơn giản! Khi bạn bước vào cửa hàng, mua một chiếc iPhone 30 triệu, nhân viên sẽ đon đả làm cho bạn một hồ sơ "Trả góp 0%". Nhưng sự thật động trời là: Họ KHÔNG HỀ cho bạn nợ!

Ngay tại khoảnh khắc bạn đặt bút ký tên, các tổ chức tài chính/ngân hàng đã lập tức giải ngân, bơm thẳng 30 triệu "tiền tươi thóc thật" vào tài khoản của ông trùm bán lẻ.

Ông trùm sẵn sàng trích lại một khoản phí rất nhỏ (chiết khấu) cho ngân hàng, để đánh đổi lấy 3 ĐẶC QUYỀN VÔ GIÁ:
❶ Chuyển giao rủi ro 100%: Khách bùng nợ? Đó là việc của ngân hàng, không phải việc của công ty.
❷ Bẻ gãy rào cản giá: Biến một chiếc điện thoại 30 triệu xa xỉ thành một món đồ rẻ bèo chỉ 2,5 triệu/tháng.
❸ Giải phóng hàng tồn thần tốc: Tiền mặt thu về ngay giây thứ nhất, tiếp tục được xoay vòng đi nhập lô hàng mới.

BÀI HỌC THỨC TỈNH:
Để khách hàng nợ bằng chính tiền túi (vốn lưu động) của mình là tư duy của thập kỷ trước. Bán hàng đỉnh cao là phải biết dùng đòn bẩy – "Mượn tiền người khác" để kinh doanh!

Lãi trên giấy là ẢO, Tiền trong két mới là THẬT! Kẻ mạnh không phải là kẻ bán hàng rẻ nhất, mà là kẻ giữ được nhiều tiền mặt nhất khi giông bão ập tới.`,
            likes: 189,
            comments: 52,
            shares: 94,
            isLiked: false,
            isSaved: false,
            createdAt: new Date('2026-08-02T14:15:00'),
            tags: ['tài_chính', 'trả_góp', 'kinh_doanh', 'dòng_tiền'],
            type: 'post',
            privacy: 'public'
        },
        {
            id: 3,
            author: {
                id: 3,
                name: 'Phùng Lê Lâm Hải',
                avatar: 'assets/avatars/avatar.jpg',
                username: 'phunglelamhai',
                role: 'Chuyên gia tài chính tại Equitix',
                isVerified: true
            },
            title: 'EVERY HALF - Chuỗi Specialty Coffee Gọi Vốn 8 Triệu USD Series A',
            content: `EVERY HALF - CHUỖI SPECIALTY COFFEE VỪA GỌI VỐN 8 TRIỆU USD VÒNG SERIES A VÀ BÀI HỌC DÀNH CHO FOUNDERS

Hôm qua giờ khá nhiều founders hỏi mình: "Anh ơi, Every Half gọi được Series A rồi. Làm bằng cách nào vậy nhỉ?"

Sau đây là các lý do chia sẻ về model của Every Half: Từ tài chính tới định vị thị trường và cách NDT tổ chức nhìn tài sản này để quyết định đầu tư:

1. Founder team đã có track record trên thị trường tài chính.
Người khởi nguồn của Every Half là Trần Lê Minh Trúc - nghệ nhân rang cà phê, từng làm việc ở Urban Station, The Coffee House. CEO Võ Duy Phú - Cựu Phó Tổng Giám đốc The Coffee House: Operation, Finance, Tech. Một team founder với năng lực bù trừ hoàn hảo.

2. Team founder mạnh có liên quan tới nhau ở thương vụ trước
Every Half có thêm Mr Nguyễn Hải Ninh - Founder The Coffee House. M Village góp khoảng 80% vốn điều lệ. Founder team từng làm việc cùng nhau ở The Coffee House, đã va chạm, đã hiểu nhau và biết cách phối hợp.

3. Tài chính không phải lợi thế đầu tiên - Quan hệ mới là lợi thế đầu tiên.
Quỹ không chỉ nhìn từng CV mà còn nhìn vào lịch sử cộng tác. Đó là một tín hiệu khiến signaling cost giảm đi rất nhiều.

4. Định vị của Every Half Coffee: "Affordable Specialty Coffee", chuẩn SCA, giải quốc tế, nguồn gốc minh bạch. Khoảng trống: Specialty thường rất đắt. Mass-market thì không specialty. Every Half đứng ở giữa.

5. Chuỗi cung ứng: Every Half không chỉ bán cà phê. Họ có 2 xưởng rang, làm việc trực tiếp với nông dân, hợp tác từ 8ha lên 50ha, có truy xuất nguồn gốc + phát triển Fine Robusta.

6. Unit Economics dự đoán:
• Khoảng 250 giao dịch/ngày
• Giá bán trung bình khoảng 72.000 đồng
• Doanh thu khoảng 540 triệu/tháng
• COGS khoảng 28%, nhân sự khoảng 18%, mặt bằng khoảng 12%
• Contribution margin khoảng 34%
• Hoàn vốn khoảng 4-5 tháng

7. Funding rounds:
• Seed (8/2024): Khoảng 8 cửa hàng
• Pre-Series A (5/2025): 3 triệu USD, khoảng 14 cửa hàng
• Series A (7/2026): 8 triệu USD, 35-36 cửa hàng

Founders học được gì?
1. Founder-Market Fit dựa trên track record ấn tượng trong quá khứ
2. Người giỏi sản phẩm chưa chắc là người giỏi gọi vốn - Dream team cần cả 2
3. Đồng sáng lập từng làm việc với nhau đáng giá hơn nhiều CV đẹp
4. Branding với nhà đầu tư cũng quan trọng như branding với khách hàng
5. Unit Economics đẹp chưa đủ, hiểu tổng thể mô hình KD để nắm rõ động lực của vốn lưu động
6. Cashflow luôn quan trọng hơn Profit
7. Scale nhanh nhưng governance không theo kịp sẽ rất nguy hiểm
8. Lợi thế cạnh tranh thật sự nằm ở hệ thống, chuỗi cung ứng và con người
9. Quỹ đầu tư không mua doanh thu - Quỹ mua khả năng nhân bản với ít biến động trong tương lai

Điều cuối cùng: Vốn không tạo ra doanh nghiệp tốt. Doanh nghiệp tốt mới hấp thụ được vốn.`,
            likes: 356,
            comments: 87,
            shares: 142,
            isLiked: false,
            isSaved: false,
            createdAt: new Date('2026-08-06T09:00:00'),
            tags: ['gọi_vốn', 'startup', 'coffee', 'series_a', 'F&B'],
            type: 'post',
            privacy: 'public'
        },
        {
            id: 4,
            author: {
                id: 4,
                name: 'Diễn đàn SME',
                avatar: 'assets/avatars/avatar.jpg',
                username: 'diendansme',
                role: 'Thành viên cộng đồng',
                isVerified: false
            },
            title: 'Mọi người thấy quan điểm này đúng không?',
            content: `Mọi người thấy quan điểm này đúng không?

Theo mình, trong kinh doanh, yếu tố con người và đội nhóm quan trọng hơn ý tưởng rất nhiều. Một ý tưởng hay với một đội ngũ yếu sẽ thất bại. Nhưng một đội ngũ mạnh có thể biến một ý tưởng bình thường thành điều phi thường.

Bạn nghĩ sao? Hãy chia sẻ quan điểm của bạn bên dưới nhé!`,
            likes: 67,
            comments: 24,
            shares: 8,
            isLiked: false,
            isSaved: false,
            createdAt: new Date('2026-08-07T08:00:00'),
            tags: ['thảo_luận', 'góc_nhìn', 'khởi_nghiệp'],
            type: 'post',
            privacy: 'public'
        }
    ];

    getPosts(): Observable<SocialPost[]> {
        return of(this.posts);
    }

    getMembers(): Observable<SocialMember[]> {
        const members: SocialMember[] = [
            // { id: 1, name: 'Nguyễn Văn A', username: 'nguyenvana', avatar: 'assets/avatars/avatar.jpg', role: 'CEO', company: 'Công nghệ Xanh', followers: 150, following: 80, posts: 45, isFollowing: true, isOnline: true, isVerified: true },
            // { id: 2, name: 'Trần Thị B', username: 'tranb', avatar: 'assets/avatars/avatar.jpg', role: 'Marketing Director', company: 'Logistics Thành Công', followers: 120, following: 60, posts: 32, isFollowing: false, isOnline: true, isVerified: false },
            // { id: 3, name: 'Lê Văn C', username: 'levanc', avatar: 'assets/avatars/avatar.jpg', role: 'Founder', company: 'Thực phẩm Sạch 365', followers: 200, following: 100, posts: 56, isFollowing: true, isOnline: false, isVerified: true },
            // { id: 4, name: 'Phạm Thị D', username: 'phamd', avatar: 'assets/avatars/avatar.jpg', role: 'CTO', company: 'Nội thất Xanh', followers: 80, following: 40, posts: 28, isFollowing: false, isOnline: true, isVerified: false },
        ];
        return of(members);
    }

    getEvents(): Observable<SocialEvent[]> {
        const events: SocialEvent[] = [
            {
                id: 1,
                title: 'Webinar: Chiến lược phát triển 2026',
                description: 'Chia sẻ chiến lược phát triển kinh doanh trong bối cảnh mới',
                date: new Date('2026-03-20T14:00:00'),
                location: 'Online - Zoom',
                type: 'online',
                maxParticipants: 100,
                currentParticipants: 65,
                image: 'assets/events/webinar.jpg',
                organizer: 'Nguyễn Văn A',
                isRegistered: false
            },
            {
                id: 2,
                title: 'Meetup: Kết nối doanh nhân TP.HCM',
                description: 'Gặp gỡ, kết nối và chia sẻ kinh nghiệm kinh doanh',
                date: new Date('2026-03-25T18:00:00'),
                location: 'Quận 1, TP.HCM',
                type: 'offline',
                maxParticipants: 50,
                currentParticipants: 30,
                image: 'assets/events/Meetup.jpg',
                organizer: 'Trần Thị B',
                isRegistered: false
            }
        ];
        return of(events);
    }

    getGroups(): Observable<SocialGroup[]> {
        const groups: SocialGroup[] = [
            { id: 1, name: 'Công nghệ & Khởi nghiệp', description: 'Thảo luận về công nghệ và xu hướng khởi nghiệp', icon: 'fa-solid fa-microchip', members: 120, posts: 45, isJoined: true, isPrivate: false },
            { id: 2, name: 'Marketing & Branding', description: 'Chia sẻ kiến thức marketing và xây dựng thương hiệu', icon: 'fa-solid fa-bullhorn', members: 85, posts: 32, isJoined: false, isPrivate: false },
            { id: 3, name: 'Tài chính & Đầu tư', description: 'Thảo luận về tài chính doanh nghiệp và đầu tư', icon: 'fa-solid fa-chart-line', members: 60, posts: 28, isJoined: false, isPrivate: true },
        ];
        return of(groups);
    }

    likePost(postId: number): Observable<any> {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
        }
        return of({ success: true });
    }

    savePost(postId: number): Observable<any> {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.isSaved = !post.isSaved;
        }
        return of({ success: true });
    }

    createPost(data: {
        title?: string;
        content: string;
        type?: string;
        privacy?: string;
        tags?: string[];
        images?: File[]
    }): Observable<SocialPost> {
        const newPost: SocialPost = {
            id: this.posts.length + 1,
            author: {
                id: 1,
                name: 'Nguyễn Văn A',
                username: 'nguyenvana',
                avatar: 'assets/avatars/user1.jpg',
                role: 'CEO',
                isVerified: true
            },
            title: data.title || '',
            content: data.content,
            type: (data.type as any) || 'post',
            privacy: (data.privacy as any) || 'public',
            tags: data.tags || [],
            images: [], // sẽ xử lý upload sau
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            isSaved: false,
            isExpanded: false,
            createdAt: new Date()
        };
        this.posts.unshift(newPost);
        return of(newPost).pipe(delay(300));
    }
}