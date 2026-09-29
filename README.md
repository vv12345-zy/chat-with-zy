# 燕燕的小手机

Standalone mini-phone web app for Vercel.

## Required secret

Set `GEMINI_API_KEY` in Vercel Environment Variables. It is read only by `/api/gemini` and is never sent to the browser.

Default Gemini model: `gemini-3.8-flash`.

## Features

- Separate WeChat-style chats for 陆泽阳 and Pooh Pooh
- Gemini-powered chat, Moments, Instagram posts and DMs
- Camera with browser permission diagnostics
- Photos, notes, local music player, calendar, calculator
- Instagram-style Home / Explore / Reels / Profile / DM
- Local persistence and data export/import
- Installable PWA shell
