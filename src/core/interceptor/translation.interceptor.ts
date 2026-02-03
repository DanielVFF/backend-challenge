import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { I18nService, I18nContext } from 'nestjs-i18n';

interface TranslatedResponse {
    message?: string | string[];
    [key: string]: unknown;
}

@Injectable()
export class TranslationInterceptor implements NestInterceptor {
    constructor(private readonly i18n: I18nService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(
            map((data) => this.translateResponse(data)),
            catchError((error) => {
                if (error instanceof HttpException) {
                    const translatedError = this.translateException(error);
                    return throwError(() => translatedError);
                }
                return throwError(() => error);
            }),
        );
    }

    private translateException(exception: HttpException): HttpException {
        const exceptionResponse = exception.getResponse();
        const status = exception.getStatus();

        if (typeof exceptionResponse === 'string') {
            const translatedMessage = this.translateMessage(exceptionResponse);
            return new HttpException(translatedMessage, status);
        }

        if (
            typeof exceptionResponse === 'object' &&
            exceptionResponse !== null &&
            'message' in exceptionResponse
        ) {
            const message = (exceptionResponse as { message: string | string[] })
                .message;
            const translatedMessage = Array.isArray(message)
                ? message.map((msg) => this.translateMessage(msg))
                : this.translateMessage(message);

            return new HttpException(
                {
                    ...exceptionResponse,
                    message: translatedMessage,
                },
                status,
            );
        }

        return exception;
    }

    private translateResponse(data: unknown): unknown {
        if (!data || typeof data !== 'object') {
            return data;
        }

        if (Array.isArray(data)) {
            return data.map((item) => this.translateResponse(item));
        }

        const response = data as TranslatedResponse;

        if (response.message) {
            const message = response.message;
            const translatedMessage = Array.isArray(message)
                ? message.map((msg) => this.translateMessage(msg))
                : this.translateMessage(message);

            return {
                ...response,
                message: translatedMessage,
            };
        }

        return response;
    }

    private translateMessage(message: string): string {
        if (!message || typeof message !== 'string') {
            return message;
        }

        if (this.isTranslationKey(message)) {
            try {
                const i18nContext = I18nContext.current();
                const translatedMessage = this.i18n.t(message, { lang: i18nContext?.lang });
                return translatedMessage as string;
            } catch {
                return message;
            }
        }

        return message;
    }

    private isTranslationKey(message: string): boolean {
        return (
            message.includes('.') &&
            (message.startsWith('errors.') || message.startsWith('messages.'))
        );
    }
}
