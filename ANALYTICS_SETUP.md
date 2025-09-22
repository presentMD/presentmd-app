# Analytics Setup Guide for presentMD

This guide will help you set up comprehensive traffic tracking for your presentMD web application.

## 🎯 What's Already Implemented

I've implemented a comprehensive analytics system that tracks:

### 📊 **Core Metrics**
- **Page Views**: Home page visits
- **User Sessions**: How long users stay on the siteq
- **Traffic Sources**: Where users come from (direct, social, search, etc.)

### 🎨 **Feature Usage**
- **Theme Changes**: Which themes users prefer (space, desert, gaia, etc.)
- **Presentation Mode**: How often users enter/exit presentation mode
- **PowerPoint Exports**: Export frequency and theme preferences
- **Custom CSS**: When users enable custom styling
- **Help Dialog**: How often users access help

### 🔍 **User Behavior**
- **Slide Navigation**: How users navigate through slides
- **Feature Interactions**: Button clicks and feature usage
- **Error Tracking**: App errors and issues

## 🚀 Setup Instructions

### Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new account or use existing one
3. Create a new property for your website
4. Choose "Web" as the platform
5. Enter your website URL (e.g., `https://presentmd.app`)

### Step 2: Get Your Measurement ID

1. In your Google Analytics dashboard, go to **Admin** (gear icon)
2. Select your property
3. Go to **Data Streams** → **Web**
4. Copy your **Measurement ID** (starts with `G-`)

### Step 3: Configure Environment Variables

1. Set the environment variable `VITE_GOOGLE_ANALYTICS_ID` with your Google Analytics Measurement ID:

**For local development:**
```bash
# Create a .env file in your project root
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

**For production deployment:**
Set the environment variable in your hosting platform:
- **Vercel**: Add `VITE_GOOGLE_ANALYTICS_ID` in your project settings
- **Netlify**: Add `VITE_GOOGLE_ANALYTICS_ID` in Site settings > Environment variables
- **Other platforms**: Set the environment variable as `VITE_GOOGLE_ANALYTICS_ID`

2. Add `.env` to your `.gitignore` file to keep your ID private

### Step 4: Deploy with Analytics

The analytics will automatically work when you deploy your app. The environment variable will be replaced with your actual Measurement ID.

## 📈 What You'll See in Google Analytics

### **Real-time Reports**
- Live user activity
- Current page views
- Active users right now

### **Audience Reports**
- User demographics
- Geographic location
- Device types (desktop, mobile, tablet)
- Browser information

### **Acquisition Reports**
- Traffic sources (Google, social media, direct)
- Referral websites
- Campaign performance

### **Behavior Reports**
- Most popular pages
- User flow through your app
- Time spent on site
- Bounce rate

### **Custom Events** (presentMD specific)
- `presentation_export`: When users export PowerPoint files
- `theme_change`: When users change slide themes
- `presentation_mode`: When users enter/exit presentation mode
- `custom_css`: When users enable custom CSS
- `help_dialog`: When users open/close help
- `slide_navigation`: When users navigate slides
- `feature_usage`: General feature interactions

## 🔧 Advanced Configuration

### Custom Dimensions (Optional)

You can add custom dimensions to track more specific data:

1. In Google Analytics, go to **Admin** → **Custom Definitions** → **Custom Dimensions**
2. Create dimensions for:
   - Theme preference
   - Slide count
   - User type (new vs returning)

### Goals and Conversions

Set up goals to track important actions:

1. Go to **Admin** → **Goals**
2. Create goals for:
   - PowerPoint exports
   - Presentation mode usage
   - Help dialog engagement

## 🛡️ Privacy Considerations

The analytics implementation:
- ✅ Respects user privacy
- ✅ Uses Google Analytics 4 (privacy-focused)
- ✅ No personal data collection
- ✅ GDPR compliant
- ✅ Anonymizes IP addresses

## 📊 Alternative Analytics Options

If you prefer different analytics:

### **Plausible Analytics** (Privacy-focused)
- Replace Google Analytics with Plausible
- More privacy-focused
- Simpler dashboard
- Paid service

### **Custom Analytics** (Self-hosted)
- Build your own analytics
- Full control over data
- Requires backend infrastructure

## 🚨 Troubleshooting

### Analytics Not Working?
1. Check your Measurement ID is correct
2. Verify `VITE_GOOGLE_ANALYTICS_ID` environment variable is set
3. Check browser console for errors
4. Wait 24-48 hours for data to appear

### No Data in Google Analytics?
1. Ensure your site is deployed with the `VITE_GOOGLE_ANALYTICS_ID` environment variable
2. Check that the Measurement ID is valid
3. Verify the gtag script is loading (check Network tab)
4. Test with Google Analytics Debugger extension
5. Confirm the environment variable is accessible at build time

## 📱 Mobile Analytics

The analytics also track:
- Mobile vs desktop usage
- Touch interactions
- Mobile-specific user flows

## 🎯 Key Metrics to Monitor

### **Growth Metrics**
- Daily/Monthly Active Users
- Page views per session
- Session duration
- Bounce rate

### **Feature Adoption**
- Theme usage distribution
- Export frequency
- Presentation mode usage
- Help dialog engagement

### **User Experience**
- Error rates
- Feature completion rates
- User flow analysis

## 📈 Next Steps

1. **Set up Google Analytics** following the steps above
2. **Monitor for 1-2 weeks** to get baseline data
3. **Set up custom reports** for presentMD-specific metrics
4. **Create dashboards** for key stakeholders
5. **Set up alerts** for significant changes in traffic

Your presentMD app now has comprehensive analytics tracking that will help you understand user behavior and grow your application! 🚀
