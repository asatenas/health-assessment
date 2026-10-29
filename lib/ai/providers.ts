import {
  customProvider,
  defaultSettingsMiddleware,
  // extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { gateway } from '@ai-sdk/gateway';
// import { chatModel, reasoningModel } from './models.test';
import { isTestEnvironment } from '../shared/constants';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        // 'chat-model': chatModel,
        // 'chat-model-reasoning': reasoningModel,
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
          model: gateway.languageModel('google/gemini-3.1-pro-preview'),
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
        'chat-model-reasoning': wrapLanguageModel({
          model: gateway.languageModel('openai/gpt-5.1'),
          middleware: defaultSettingsMiddleware({
            settings: {
              providerOptions: {
                openai: {
                  reasoningEffort: 'medium',
                  // reasoningSummary: 'auto',
                  serviceTier: 'priority',
                  textVerbosity: 'medium',
                },
              },
            },
          }),
        }),
        'title-model': gateway.languageModel('openai/gpt-4.1-mini'),
        'artifact-model': gateway.languageModel('openai/gpt-4.1-mini'),
      },
    });
