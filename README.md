# Alphonse Afanyu Portfolio

Next.js landing page for Vercel.

## Local development

```bash
npm install
npm run dev
```

## Contact delivery

The contact API validates input, uses a honeypot, and rate-limits repeated submissions. Create a Resend API key and configure the variables from `.env.example` in `.env.local` and in Vercel. `CONTACT_FROM_EMAIL` must use a domain verified in Resend. Without these credentials, the form shows a delivery error and visitors can use the displayed email or WhatsApp booking link.

## CV

Visit `/cv` and choose **Print / Save PDF** to download a PDF using the browser print dialog.
