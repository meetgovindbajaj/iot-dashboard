export declare const Roles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
import { ExecutionContext } from "@nestjs/common";
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    getRequest(context: ExecutionContext): any;
}
export {};
