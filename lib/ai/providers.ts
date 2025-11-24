import {
  customProvider,
  defaultSettingsMiddleware,
  // extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { chatModel, reasoningModel } from './models.test';
import { isTestEnvironment } from '../shared/constants';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
      },
    })
  : customProvider({
      languageModels: {
        // 'chat-model': wrapLanguageModel({
        //   model: gateway.languageModel('openai/gpt-5'),
        //   middleware: defaultSettingsMiddleware({
        //     settings: {
        //       providerOptions: {
        //         openai: {
        //           reasoningEffort: 'medium',
        //           // reasoningSummary: 'auto',
        //           serviceTier: 'priority',
        //           textVerbosity: 'medium',
        //         },
        //       },
        //     },
        //   }),
        // }),
        'chat-model': wrapLanguageModel({
          model: gateway.languageModel('google/gemini-3-pro-preview'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                google: {
                  thinkingConfig: {
                    thinkingLevel: 'high',
                    includeThoughts: false,
                  },
                },
              },
            },
          }),
        }),
        'gpt-5-medium': wrapLanguageModel({
          model: gateway.languageModel('openai/gpt-5'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                openai: {
                  reasoningEffort: 'medium',
                  reasoningSummary: 'auto',
                  serviceTier: 'priority',
                  textVerbosity: 'medium',
                },
              },
            },
          }),
        }),
        'gpt-5-high': wrapLanguageModel({
          model: gateway.languageModel('openai/gpt-5'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                openai: {
                  reasoningEffort: 'high',
                  reasoningSummary: 'auto',
                  serviceTier: 'priority',
                  textVerbosity: 'medium',
                },
              },
            },
          }),
        }),
        'gpt-5-pro-medium': wrapLanguageModel({
          model: gateway.languageModel('openai/gpt-5-pro'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                openai: {
                  reasoningEffort: 'medium',
                  reasoningSummary: 'auto',
                  serviceTier: 'priority',
                  textVerbosity: 'medium',
                },
              },
            },
          }),
        }),
        'gpt-5-pro-high': wrapLanguageModel({
          model: gateway.languageModel('openai/gpt-5-pro'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                openai: {
                  reasoningEffort: 'high',
                  reasoningSummary: 'auto',
                  serviceTier: 'priority',
                  textVerbosity: 'medium',
                },
              },
            },
          }),
        }),
        'gpt-5.1-medium': wrapLanguageModel({
          model: gateway.languageModel('openai/gpt-5.1'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                openai: {
                  reasoningEffort: 'medium',
                  reasoningSummary: 'auto',
                  serviceTier: 'priority',
                  textVerbosity: 'medium',
                },
              },
            },
          }),
        }),
        'gpt-5.1-high': wrapLanguageModel({
          model: gateway.languageModel('openai/gpt-5.1'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                openai: {
                  reasoningEffort: 'high',
                  reasoningSummary: 'auto',
                  serviceTier: 'priority',
                  textVerbosity: 'medium',
                },
              },
            },
          }),
        }),
        'gpt-5.1-thinking-medium': wrapLanguageModel({
          model: gateway.languageModel('openai/gpt-5.1-thinking'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                openai: {
                  reasoningEffort: 'medium',
                  reasoningSummary: 'auto',
                  serviceTier: 'priority',
                  textVerbosity: 'medium',
                },
              },
            },
          }),
        }),
        'gpt-5.1-thinking-high': wrapLanguageModel({
          model: gateway.languageModel('openai/gpt-5.1-thinking'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                openai: {
                  reasoningEffort: 'high',
                  reasoningSummary: 'auto',
                  serviceTier: 'priority',
                  textVerbosity: 'medium',
                },
              },
            },
          }),
        }),
        'gemini-3-pro-preview-medium': wrapLanguageModel({
          model: gateway.languageModel('google/gemini-3-pro-preview'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                google: {
                  thinkingConfig: {
                    includeThoughts: true,
                  },
                },
              },
            },
          }),
        }),
        'gemini-3-pro-preview-high': wrapLanguageModel({
          model: gateway.languageModel('google/gemini-3-pro-preview'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                google: {
                  thinkingConfig: {
                    thinkingLevel: 'high',
                    includeThoughts: true,
                  },
                },
              },
            },
          }),
        }),
        'title-model': gateway.languageModel('openai/gpt-4.1-mini'),
        'artifact-model': gateway.languageModel('openai/gpt-4.1-mini'),
      },
    });
