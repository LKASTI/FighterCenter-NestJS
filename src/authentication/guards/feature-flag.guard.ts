import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const isDisabled = this.reflector.get<boolean>('disabled', context.getHandler());

        if (isDisabled) {
            throw new ForbiddenException('You cannot access this');
        }

        return true;
    }
}