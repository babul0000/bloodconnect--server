import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    currentUser?: any;
}
export declare const authorizeAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=auth.d.ts.map