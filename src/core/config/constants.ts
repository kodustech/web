export const API_ROUTES = {
    login: "/auth/login",
    register: "/auth/signup",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    confirmEmail: "/auth/confirm-email",
    resendEmail: "/auth/resend-email",
    resetPassword: "/auth/reset-password",
    createNewPassword: "/auth/create-new-password",
    refreshToken: "/auth/refresh",
    post: "/api/post",
    posts: "/api/post/all",
    refresh: "/api/refresh",
    getInviteData: "/user/invite",
    completeUserInvitation: "/user/invite/complete-invitation",
    segmentTrack: "/segment/track",
    loginOAuth: "/auth/oauth",
    checkForEmailExistence: "/user/email",
    getOrganizationsByDomain: "/organization/domain",
} as const;

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES];
