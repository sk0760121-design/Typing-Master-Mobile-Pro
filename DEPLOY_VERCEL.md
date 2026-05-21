# Vercel Deployment Guide | डिप्लॉयमेंट गाइड 🚀

इस प्रोजेक्ट को Vercel पर डिप्लॉय करना बहुत आसान है। आप नीचे दिए गए दो तरीकों में से किसी भी एक का उपयोग कर सकते हैं:

---

## तरीका 1: GitHub / GitLab के ज़रिए (सबसे आसान और बेस्ट तरीका) 💻

अगर आपका कोड GitHub पर अपलोडेड है, तो आप इसे सिर्फ 2 मिनट में Vercel पर लाइव कर सकते हैं:

1. **GitHub पर कोड डालें**:
   - Google AI Studio के **Settings Menu** (ऊपर दाईं ओर) पर क्लिक करें।
   - **Export to GitHub** चुनें। इससे आपका पूरा प्रोजेक्ट आपके GitHub अकाउंट में ट्रांसफर हो जाएगा।

2. **Vercel पर लॉगिन करें**:
   - **[vercel.com](https://vercel.com/)** पर जाएं और अपने GitHub अकाउंट से Sign In/Sign Up करें।

3. **प्रोजेक्ट इम्पोर्ट करें**:
   - Vercel डैशबोर्ड पर **"Add New..."** बटन पर क्लिक करें और फिर **"Project"** चुनें।
   - अपनी GitHub repositories की लिस्ट में से इस प्रोजेक्ट को ढूंढें और **"Import"** पर क्लिक करें।

4. **Settings & Deploy**:
   - Vercel ऑटोमैटिकली पहचान लेगा कि यह एक **Vite** प्रोजेक्ट है।
   - **Framework Preset**: `Vite` (ऑटो-डिटेक्टेड) होना चाहिए।
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - नीचे दिए गए **"Deploy"** बटन पर क्लिक करें! 🚀

बस! कुछ ही सेकंड में आपका ऐप लाइव हो जाएगा और आपको एक कस्टम URL (`your-app.vercel.app`) मिल जाएगा।

---

## तरीका 2: Vercel CLI (कमांड लाइन) का इस्तेमाल करके 🛠️

अगर आप अपने लोकल कंप्यूटर (Local Machine) से सीधा टर्मिनल के ज़रिए डिप्लॉय करना चाहते हैं:

1. **यह कोड अपने कंप्यूटर पर डाउनलोड करें**:
   - AI Studio के **Settings** मेनू से **Export as ZIP** करके प्रोजेक्ट डाउनलोड करें और उसे अपने कंप्यूटर पर एक्सट्रेक्ट कर लें।

2. **Vercel CLI इंस्टॉल करें**:
   अपने टर्मिनल में यह कमांड चलाएं (इसके लिए Node.js इंस्टॉल होना चाहिए):
   ```bash
   npm install -g vercel
   ```

3. **लॉगिन करें**:
   ```bash
   vercel login
   ```
   (यह आपके ब्राउज़र में लॉगिन विंडो खोलेगा).

4. **डिप्लॉय करें**:
   प्रोजेक्ट के फोल्डर के अंदर जाकर सिर्फ यह कमांड चलाएं:
   ```bash
   vercel
   ```
   - सभी सवालों के डिफ़ॉल्ट जवाबों के लिए एंटर दबाते जाएं।
   - यह डिप्लॉयमेंट के बाद आपको एक **Preview Link** देगा।

5. **प्रोडक्शन (Production) में लाइव करें**:
   ```bash
   vercel --prod
   ```

---

### 💡 महत्वपूर्ण सुझाव (Deployment Best Practices):
- **React Components / Sound / Theme Assets**: हमारे ऐप के सारे कस्टमाइजेशन (Accent colors, custom fonts, physical audio preset controls, light/dark modes) और **Ambient generative focus loops** पहले से ही पूरी तरह से अनुकूलित (optimized) हैं और बिना किसी बदलाव के Vercel पर तुरंत लाइव चलेंगे।
- Vercel पर फ़ाइलों का राउटिंग सही रखने के लिए हमने एक सिंगल-पेज क्लाइंट-साइड एसपीए (SPA) संरचना तैयार की है।

---

# Vercel Deployment Guide (English Version) 🌐

## Option 1: Via GitHub (Recommended)
1. In AI Studio, click on the **Settings Menu** at the top right and select **Export to GitHub** to link and push your repository.
2. Sign in to your **[Vercel Dashboard](https://vercel.com/)** using the same GitHub account.
3. Click **Add New...** > **Project**, import your repository, and click **Deploy**. Vercel automatically configures the Vite build directives (`npm run build`, output folder `dist`).

## Option 2: Via Vercel CLI (Local Machine)
1. Export your project as a ZIP file from the AI Studio settings and extract it locally.
2. Run `npm install -g vercel` in your local terminal.
3. Authenticate with `vercel login`.
4. Deploy by running `vercel` in the project root directory, then run `vercel --prod` to make it final!
