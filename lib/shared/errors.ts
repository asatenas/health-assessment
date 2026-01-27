export type ErrorType =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limit'
  | 'offline';

export type Surface =
  | 'chat'
  | 'auth'
  | 'api'
  | 'stream'
  | 'database'
  | 'history'
  | 'vote'
  | 'document'
  | 'suggestions';

export type ErrorCode = `${ErrorType}:${Surface}`;

export type ErrorVisibility = 'response' | 'log' | 'none';

export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
  database: 'log',
  chat: 'response',
  auth: 'response',
  stream: 'response',
  api: 'response',
  history: 'response',
  vote: 'response',
  document: 'response',
  suggestions: 'response',
};

export class ChatSDKError extends Error {
  public type: ErrorType;
  public surface: Surface;
  public statusCode: number;

  constructor(errorCode: ErrorCode, cause?: string) {
    super();

    const [type, surface] = errorCode.split(':');

    this.type = type as ErrorType;
    this.cause = cause;
    this.surface = surface as Surface;
    this.message = getMessageByErrorCode(errorCode);
    this.statusCode = getStatusCodeByType(this.type);
  }

  public toResponse() {
    const code: ErrorCode = `${this.type}:${this.surface}`;
    const visibility = visibilityBySurface[this.surface];

    const { message, cause, statusCode } = this;

    if (visibility === 'log') {
      console.error({
        code,
        message,
        cause,
      });

      return Response.json(
        { code: '', message: 'Something went wrong. Please try again later.' },
        { status: statusCode },
      );
    }

    return Response.json({ code, message, cause }, { status: statusCode });
  }
}

export function getMessageByErrorCode(errorCode: ErrorCode): string {
  if (errorCode.includes('database')) {
    // English: 'An error occurred while executing a database query.'
    return 'Ocorreu um erro ao executar uma consulta ao banco de dados.';
  }

  switch (errorCode) {
    case 'bad_request:api':
      // English: "The request couldn't be processed. Please check your input and try again."
      return 'A solicitação não pôde ser processada. Verifique seus dados e tente novamente.';
    case 'forbidden:api':
      // English: "You don't have permission to perform this action."
      return 'Você não tem permissão para realizar esta ação.';

    case 'unauthorized:auth':
      // English: 'You need to sign in before continuing.'
      return 'Você precisa entrar antes de continuar.';
    case 'forbidden:auth':
      // English: 'Your account does not have access to this feature.'
      return 'Sua conta não tem acesso a este recurso.';

    case 'rate_limit:chat':
      // English: 'You have exceeded your maximum number of messages for the day. Please try again later.'
      return 'Você excedeu o número máximo de mensagens para o dia. Por favor, tente novamente mais tarde.';
    case 'not_found:chat':
      // English: 'The requested chat was not found. Please check the chat ID and try again.'
      return 'O chat solicitado não foi encontrado. Verifique o ID do chat e tente novamente.';
    case 'forbidden:chat':
      // English: 'This chat belongs to another user. Please check the chat ID and try again.'
      return 'Este chat pertence a outro usuário. Verifique o ID do chat e tente novamente.';
    case 'unauthorized:chat':
      // English: 'You need to sign in to view this chat. Please sign in and try again.'
      return 'Você precisa entrar para visualizar este chat. Faça login e tente novamente.';
    case 'offline:chat':
      // English: "We're having trouble sending your message. Please check your internet connection and try again."
      return 'Estamos tendo problemas para enviar sua mensagem. Verifique sua conexão com a internet e tente novamente.';

    case 'not_found:document':
      // English: 'The requested document was not found. Please check the document ID and try again.'
      return 'O documento solicitado não foi encontrado. Verifique o ID do documento e tente novamente.';
    case 'forbidden:document':
      // English: 'This document belongs to another user. Please check the document ID and try again.'
      return 'Este documento pertence a outro usuário. Verifique o ID do documento e tente novamente.';
    case 'unauthorized:document':
      // English: 'You need to sign in to view this document. Please sign in and try again.'
      return 'Você precisa entrar para visualizar este documento. Faça login e tente novamente.';
    case 'bad_request:document':
      // English: 'The request to create or update the document was invalid. Please check your input and try again.'
      return 'A solicitação para criar ou atualizar o documento é inválida. Verifique seus dados e tente novamente.';

    default:
      // English: 'Something went wrong. Please try again later.'
      return 'Algo deu errado. Por favor, tente novamente mais tarde.';
  }
}

function getStatusCodeByType(type: ErrorType) {
  switch (type) {
    case 'bad_request':
      return 400;
    case 'unauthorized':
      return 401;
    case 'forbidden':
      return 403;
    case 'not_found':
      return 404;
    case 'rate_limit':
      return 429;
    case 'offline':
      return 503;
    default:
      return 500;
  }
}
