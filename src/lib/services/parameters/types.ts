export enum ParametersConfigKey {
    BOARD_PRIORITY_TYPE = "board_priority_type",
    PLATFORM_CONFIGS = "platform_configs",
    LANGUAGE_CONFIG = "language_config",
    CODE_REVIEW_CONFIG = "code_review_config",
    ISSUE_CREATION_CONFIG = "issue_creation_config",
}

export enum OrganizationParametersConfigKey {
    TIMEZONE_CONFIG = "timezone_config",
    AUTO_JOIN_CONFIG = "auto_join_config",
    BYOK_CONFIG = "byok_config",
    COCKPIT_METRICS_VISIBILITY = "cockpit_metrics_visibility",
}

export enum BoardPriorityType {
    LEXORANK_PRIORITY = "lexorank_priority",
    PRIORITY_FIELD = "priority_field",
    KANBAN_PRIORITY = "kanban_priority",
}

export type PlatformConfigValue = {
    finishOnboard?: boolean;
    finishProjectManagementConnection?: boolean;
    kodyLearningStatus?: KodyLearningStatus;
};

export enum KodyLearningStatus {
    ENABLED = "enabled",
    DISABLED = "disabled",
    GENERATING_RULES = "generating_rules",
    GENERATING_CONFIG = "generating_config",
}

export enum LanguageValue {
    ENGLISH = "en-US",
    PORTUGUESE_BR = "pt-BR",
    PORTUGUESE_PT = "pt-PT",
    SPANISH = "es-ES",
    FRENCH = "fr-FR",
    GERMAN = "de-DE",
    ITALIAN = "it-IT",
    DUTCH = "nl-NL",
    POLISH = "pl-PL",
    RUSSIAN = "ru-RU",
    ARABIC = "ar-SA",
    CHINESE_MAINLAND = "zh-CN",
    HINDI = "hi-IN",
    JAPANESE = "ja-JP",
    KOREAN = "ko-KR",
    VIETNAMESE = "vi-VN",
    THAI = "th-TH",
    SWEDISH = "sv-SE",
    FINNISH = "fi-FI",
    NORWEGIAN = "nb-NO",
    DANISH = "da-DK",
    CZECH = "cs-CZ",
    HUNGARIAN = "hu-HU",
    UKRAINIAN = "uk-UA",
    TAMIL = "ta-IN",
    TELUGU = "te-IN",
    HEBREW = "he-IL",
    TURKISH = "tr-TR",
    INDONESIAN = "id-ID",
    MALAY = "ms-MY",
    GREEK = "el-GR",
    ROMANIAN = "ro-RO",
    BULGARIAN = "bg-BG",
}

export enum Timezone {
    NEW_YORK = "America/New_York",
    SAO_PAULO = "America/Sao_Paulo",
}

export type OrganizationParametersAutoJoinConfig = {
    enabled: boolean;
    domains: string[];
};

export interface CockpitMetricsVisibility {
    summary: {
        deployFrequency: boolean;
        prCycleTime: boolean;
        kodySuggestions: boolean;
        bugRatio: boolean;
        prSize: boolean;
    };
    details: {
        leadTimeBreakdown: boolean;
        prCycleTime: boolean;
        prsOpenedVsClosed: boolean;
        prsMergedByDeveloper: boolean;
        teamActivity: boolean;
    };
}
