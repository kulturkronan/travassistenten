interface LoginSession {
    success: boolean;
    cookies: string;
    userAgent: string;
    steps: string[];
    error?: string;
}
export declare function interactiveLoginSession(): Promise<LoginSession>;
export { LoginSession };
//# sourceMappingURL=interactive-login.d.ts.map