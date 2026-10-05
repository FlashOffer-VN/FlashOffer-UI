import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    AdminBusinessGroupQuery,
    BusinessGroupCommentListResponse,
    BusinessGroupCommentResponse,
    BusinessGroupDetailResponse,
    BusinessGroupListResponse,
    BusinessGroupMemberListResponse,
    BusinessGroupMemberQuery,
    BusinessGroupPostListResponse,
    BusinessGroupPostResponse,
    BusinessGroupResponse,
    BusinessGroupQuery,
    ForwardedGroupListResponse,
    CreateBusinessGroupRequest,
    CreateCommunityGroupRequest,
    CreateGroupPostRequest,
    UpdateCommunityApprovalRequest,
    GroupPostQuery,
    JoinBusinessGroupRequest,
    JoinBusinessGroupResponse,
    UpdateGroupMemberStatusRequest,
    UpdateGroupPostRequest
} from '@core/models/business-group.model';

/**
 * Nhóm theo lĩnh vực kinh doanh.
 * LƯU Ý: chỉ gửi param có giá trị thật — HttpParams serialize undefined thành chuỗi "undefined"
 * khiến API lọc sai (bài học từ tab mua chung).
 */
@Injectable({
    providedIn: 'root'
})
export class BusinessGroupService {
    private readonly endpoint = 'BusinessGroups';

    constructor(private readonly api: ApiService) { }

    // ===== Công khai =====
    getPublic(query: BusinessGroupQuery = {}): Observable<BusinessGroupListResponse> {
        const params: Record<string, unknown> = {
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 12,
            mineOnly: query.mineOnly ?? false
        };
        if (query.search?.trim()) params['search'] = query.search.trim();
        if (query.searchField) params['searchField'] = query.searchField;
        if (query.businessFieldId) params['businessFieldId'] = query.businessFieldId;

        params['sortBy'] = 'CreatedAt';
        params['sortOrder'] = 'desc';

        return this.api.get<BusinessGroupListResponse>(`${this.endpoint}/public`, params);
    }

    /** Nhóm ngành đã có bài chuyển tiếp cho bản ghi này (admin) — cảnh báo trước khi gửi */
    getForwardedGroups(refId: string): Observable<ForwardedGroupListResponse> {
        return this.api.get<ForwardedGroupListResponse>(`${this.endpoint}/forwarded-groups`, { refId, sortBy: 'CreatedAt', sortOrder: 'desc' });
    }

    getPublicDetail(id: string): Observable<BusinessGroupDetailResponse> {
        return this.api.get<BusinessGroupDetailResponse>(`${this.endpoint}/${id}/public`);
    }

    // ===== Hội nhóm (người dùng tự tạo theo chủ đề) =====
    /** Danh sách hội nhóm: hội đã duyệt + hội của chính mình (mọi trạng thái) */
    getCommunity(query: BusinessGroupQuery = {}): Observable<BusinessGroupListResponse> {
        const params: Record<string, unknown> = {
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 12,
            mineOnly: query.mineOnly ?? false
        };
        if (query.search?.trim()) params['search'] = query.search.trim();
        if (query.searchField) params['searchField'] = query.searchField;

        params['sortBy'] = 'CreatedAt';
        params['sortOrder'] = 'desc';

        return this.api.get<BusinessGroupListResponse>(`${this.endpoint}/community`, params);
    }

    /** Nhóm của tôi: nhóm mình tạo và/hoặc nhóm mình đã tham gia (nhóm ngành + hội nhóm) */
    getMine(query: BusinessGroupQuery = {}): Observable<BusinessGroupListResponse> {
        const params: Record<string, unknown> = {
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 12
        };
        if (query.search?.trim()) params['search'] = query.search.trim();
        if (query.searchField) params['searchField'] = query.searchField;
        if (query.mineRole) params['mineRole'] = query.mineRole;

        params['sortBy'] = 'CreatedAt';
        params['sortOrder'] = 'desc';

        return this.api.get<BusinessGroupListResponse>(`${this.endpoint}/mine`, params);
    }

    /** Người dùng tạo hội nhóm theo chủ đề (chờ admin duyệt mở hội) */
    createCommunity(request: CreateCommunityGroupRequest): Observable<BusinessGroupResponse> {
        return this.api.post<BusinessGroupResponse>(`${this.endpoint}/community`, request);
    }

    /** Admin duyệt / từ chối mở hội nhóm */
    updateCommunityApproval(id: string, request: UpdateCommunityApprovalRequest): Observable<BusinessGroupResponse> {
        return this.api.put<BusinessGroupResponse>(`${this.endpoint}/community/${id}/approval`, request);
    }

    join(id: string, request: JoinBusinessGroupRequest): Observable<JoinBusinessGroupResponse> {
        return this.api.post<JoinBusinessGroupResponse>(`${this.endpoint}/${id}/join`, request);
    }

    leave(id: string): Observable<{ message: string }> {
        return this.api.delete<{ message: string }>(`${this.endpoint}/${id}/join`);
    }

    // ===== Bài đăng trong nhóm =====
    getPosts(groupId: string, query: GroupPostQuery = {}): Observable<BusinessGroupPostListResponse> {
        const params: Record<string, unknown> = {
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 20
        };
        if (query.search?.trim()) params['search'] = query.search.trim();
        if (query.type) params['type'] = query.type;
        if (query.privateOnly) params['privateOnly'] = true;

        params['sortBy'] = 'CreatedAt';
        params['sortOrder'] = 'desc';

        return this.api.get<BusinessGroupPostListResponse>(`${this.endpoint}/${groupId}/posts`, params);
    }

    createPost(groupId: string, request: CreateGroupPostRequest): Observable<BusinessGroupPostResponse> {
        return this.api.post<BusinessGroupPostResponse>(`${this.endpoint}/${groupId}/posts`, request);
    }

    updatePost(groupId: string, postId: string, request: UpdateGroupPostRequest): Observable<BusinessGroupPostResponse> {
        return this.api.put<BusinessGroupPostResponse>(`${this.endpoint}/${groupId}/posts/${postId}`, request);
    }

    deletePost(groupId: string, postId: string): Observable<{ message: string }> {
        return this.api.delete<{ message: string }>(`${this.endpoint}/${groupId}/posts/${postId}`);
    }

    // ===== Bình luận =====
    getComments(postId: string, page = 1, pageSize = 20): Observable<BusinessGroupCommentListResponse> {
        return this.api.get<BusinessGroupCommentListResponse>(`${this.endpoint}/posts/${postId}/comments`, { page, pageSize, sortBy: 'CreatedAt', sortOrder: 'desc' });
    }

    createComment(postId: string, content: string, parentCommentId?: string): Observable<BusinessGroupCommentResponse> {
        return this.api.post<BusinessGroupCommentResponse>(`${this.endpoint}/posts/${postId}/comments`, { content, parentCommentId });
    }

    deleteComment(postId: string, commentId: string): Observable<{ message: string }> {
        return this.api.delete<{ message: string }>(`${this.endpoint}/posts/${postId}/comments/${commentId}`);
    }

    // ===== Quản trị =====
    getAdminList(query: AdminBusinessGroupQuery = {}): Observable<BusinessGroupListResponse> {
        const params: Record<string, unknown> = {
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 10
        };
        if (query.search?.trim()) params['search'] = query.search.trim();
        if (query.businessFieldId) params['businessFieldId'] = query.businessFieldId;
        if (query.isActive !== null && query.isActive !== undefined) params['isActive'] = query.isActive;
        if (query.type) params['type'] = query.type;
        if (query.approvalStatus) params['approvalStatus'] = query.approvalStatus;
        if (query.hasPendingMembers) params['hasPendingMembers'] = true;
        if (query.hasPrivateRequests) params['hasPrivateRequests'] = true;
        // Cột tìm kiếm do người dùng chọn; bỏ trống = tìm mọi trường (hành vi cũ)
        if (query.searchField) params['searchField'] = query.searchField;

        params['sortBy'] = 'CreatedAt';
        params['sortOrder'] = 'desc';

        return this.api.get<BusinessGroupListResponse>(this.endpoint, params);
    }

    getAdminDetail(id: string): Observable<BusinessGroupDetailResponse> {
        return this.api.get<BusinessGroupDetailResponse>(`${this.endpoint}/${id}`);
    }

    create(request: CreateBusinessGroupRequest): Observable<BusinessGroupResponse> {
        return this.api.post<BusinessGroupResponse>(this.endpoint, request);
    }

    update(id: string, request: CreateBusinessGroupRequest): Observable<BusinessGroupResponse> {
        return this.api.put<BusinessGroupResponse>(`${this.endpoint}/${id}`, request);
    }

    remove(id: string): Observable<{ message: string }> {
        return this.api.delete<{ message: string }>(`${this.endpoint}/${id}`);
    }

    /** Danh sách nhóm đã xoá mềm (admin). GET /api/v1/businessgroups/deleted */
    getDeletedList(query: AdminBusinessGroupQuery = {}): Observable<BusinessGroupListResponse> {
        const params: Record<string, unknown> = {
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 10
        };
        if (query.search?.trim()) params['search'] = query.search.trim();
        // Cột tìm kiếm do người dùng chọn; bỏ trống = tìm mọi trường
        if (query.searchField) params['searchField'] = query.searchField;

        params['sortBy'] = 'CreatedAt';
        params['sortOrder'] = 'desc';

        return this.api.get<BusinessGroupListResponse>(`${this.endpoint}/deleted`, params);
    }

    /** Khôi phục một nhóm đã xoá mềm. POST /api/v1/businessgroups/{id}/restore */
    restore(id: string): Observable<BusinessGroupResponse> {
        return this.api.post<BusinessGroupResponse>(`${this.endpoint}/${id}/restore`, {});
    }

    getMembers(id: string, query: BusinessGroupMemberQuery = {}): Observable<BusinessGroupMemberListResponse> {
        const params: Record<string, unknown> = {
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 20
        };
        if (query.search?.trim()) params['search'] = query.search.trim();
        if (query.status) params['status'] = query.status;

        params['sortBy'] = 'CreatedAt';
        params['sortOrder'] = 'desc';

        return this.api.get<BusinessGroupMemberListResponse>(`${this.endpoint}/${id}/members`, params);
    }

    updateMemberStatus(id: string, memberId: string, request: UpdateGroupMemberStatusRequest): Observable<{ success: boolean; message: string }> {
        return this.api.put<{ success: boolean; message: string }>(
            `${this.endpoint}/${id}/members/${memberId}/status`, request);
    }

    removeMember(id: string, memberId: string): Observable<{ message: string }> {
        return this.api.delete<{ message: string }>(`${this.endpoint}/${id}/members/${memberId}`);
    }

    getPrivateRequests(id: string, query: GroupPostQuery = {}): Observable<BusinessGroupPostListResponse> {
        const params: Record<string, unknown> = { page: query.page ?? 1, pageSize: query.pageSize ?? 20, privateOnly: true };
        params['sortBy'] = 'CreatedAt';
        params['sortOrder'] = 'desc';

        return this.api.get<BusinessGroupPostListResponse>(`${this.endpoint}/${id}/private-requests`, params);
    }
}
