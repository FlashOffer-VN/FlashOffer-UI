/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,ts}"],
    theme: {
        extend: {
            colors: {
                // Brand - Màu thương hiệu
                primary: {
                    DEFAULT: '#007f94',  // ← Đổi thành #007f94 cho guest
                    light: '#24c7d7',
                    dark: '#006b80',
                },
                secondary: {
                    DEFAULT: '#1F2937',
                    light: '#374151',
                    dark: '#111827',
                },
                accent: '#EC4899',

                // Feature - Màu tính năng đặc trưng
                offer: {
                    DEFAULT: '#F97316',
                    light: '#FB923C',
                    dark: '#EA580C',
                },
                premium: {
                    DEFAULT: '#FBBF24',
                    light: '#FCD34D',
                    dark: '#F59E0B',
                },
                community: {
                    DEFAULT: '#8B5CF6',
                    light: '#A78BFA',
                    dark: '#7C3AED',
                },

                // Status - Trạng thái
                success: {
                    DEFAULT: '#10B981',
                    light: '#34D399',
                    dark: '#059669',
                },
                warning: {
                    DEFAULT: '#F59E0B',
                    light: '#FBBF24',
                    dark: '#D97706',
                },
                danger: {
                    DEFAULT: '#EF4444',
                    light: '#F87171',
                    dark: '#DC2626',
                },
                info: {
                    DEFAULT: '#3B82F6',
                    light: '#60A5FA',
                    dark: '#2563EB',
                },

                // Neutral - Sắc thái trung tính
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                }
            }
        },
    },
    plugins: [require('@tailwindcss/forms')],
}