interface LoginResult {
    cookies: string;
    userAgent: string;
    success: boolean;
    error?: string;
}
export declare function loginToATG(): Promise<LoginResult>;
export {};
//# sourceMappingURL=login.d.ts.map