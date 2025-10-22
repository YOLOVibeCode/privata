# @privata/react

**React Components for GDPR/HIPAA Compliance**

Complete React ecosystem for healthcare data compliance with Privata. Make compliance invisible to end users with beautiful, accessible UI components.

## 🚀 Quick Start

```bash
npm install @privata/react @privata/core
```

```tsx
import React from 'react';
import { Privata } from '@privata/core';
import { 
  ConsentBanner, 
  PrivacyDashboard, 
  DataExportButton,
  usePrivata 
} from '@privata/react';

// Initialize Privata
const privata = new Privata({
  // your configuration
});

function App() {
  const { userData, loading } = usePrivata(privata, { userId: 'user123' });

  return (
    <div>
      <ConsentBanner 
        privata={privata}
        onConsentChange={(consent) => console.log('Consent updated:', consent)}
      />
      
      <PrivacyDashboard 
        userId="user123"
        privata={privata}
      />
      
      <DataExportButton 
        userId="user123"
        privata={privata}
        onExportComplete={(data) => console.log('Export complete:', data)}
      />
    </div>
  );
}
```

## 🎯 Components

### **ConsentBanner**
Cookie consent and data processing consent management.

```tsx
<ConsentBanner
  privata={privata}
  position="bottom"
  theme="light"
  onConsentChange={(consent) => {
    console.log('User consent:', consent);
  }}
/>
```

### **PrivacyDashboard**
Complete privacy management interface.

```tsx
<PrivacyDashboard
  userId="user123"
  privata={privata}
  showAdvanced={true}
  onDataChange={(data) => {
    console.log('Privacy data updated:', data);
  }}
/>
```

### **DataExportButton**
One-click data export (GDPR Article 20).

```tsx
<DataExportButton
  userId="user123"
  privata={privata}
  variant="primary"
  size="medium"
  onExportComplete={(data) => {
    console.log('Data exported:', data);
  }}
/>
```

### **GDPRSettings**
Complete privacy settings dashboard.

```tsx
<GDPRSettings
  userId="user123"
  privata={privata}
  onSettingsChange={(settings) => {
    console.log('Settings updated:', settings);
  }}
/>
```

### **DataErasureForm**
Right to be forgotten interface (GDPR Article 17).

```tsx
<DataErasureForm
  userId="user123"
  privata={privata}
  onErasureComplete={(result) => {
    console.log('Data erased:', result);
  }}
/>
```

## 🎣 React Hooks

### **usePrivata**
Main hook for Privata functionality.

```tsx
const {
  privata,
  loading,
  error,
  userData,
  requestDataAccess,
  rectifyPersonalData,
  erasePersonalData,
  restrictProcessing,
  requestDataPortability,
  objectToProcessing,
  requestAutomatedDecisionReview
} = usePrivata(privataInstance, { userId: 'user123' });
```

### **useGDPR**
GDPR-specific functionality.

```tsx
const {
  loading,
  error,
  requestDataAccess,
  rectifyPersonalData,
  erasePersonalData,
  restrictProcessing,
  requestDataPortability,
  objectToProcessing,
  requestAutomatedDecisionReview
} = useGDPR(privata, { userId: 'user123' });
```

### **useHIPAA**
HIPAA-specific functionality.

```tsx
const {
  loading,
  error,
  requestPHIAccess,
  reportBreach,
  verifyDataIntegrity,
  checkAccessPermissions,
  getAuditLogs,
  updateConsent,
  minimizeData
} = useHIPAA(privata, { userId: 'user123' });
```

### **useConsent**
Consent management.

```tsx
const {
  consent,
  loading,
  error,
  updateConsent,
  acceptAll,
  rejectAll,
  hasConsent,
  isConsentValid
} = useConsent(privata, { userId: 'user123' });
```

### **useDataExport**
Data export functionality.

```tsx
const {
  loading,
  error,
  progress,
  exportData,
  downloadExport,
  getExportFormats
} = useDataExport(privata, { userId: 'user123' });
```

## 🎨 Styling

All components are unstyled by default and can be customized with CSS classes:

```css
/* Custom styling for components */
.consent-banner {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
}

.privacy-dashboard {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.data-export-button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}
```

## 📱 Responsive Design

All components are fully responsive and work on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## ♿ Accessibility

All components include:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast mode support
- Focus management

## 🌍 Internationalization

Components support internationalization with:
- RTL language support
- Customizable text and messages
- Locale-specific formatting
- Multi-language consent management

## 🔧 TypeScript Support

Full TypeScript support with:
- Complete type definitions
- IntelliSense support
- Compile-time error checking
- Generic type support

## 📚 Examples

### Complete Privacy Dashboard

```tsx
import React from 'react';
import { Privata } from '@privata/core';
import { 
  PrivacyDashboard,
  ConsentBanner,
  DataExportButton,
  usePrivata 
} from '@privata/react';

function PrivacyApp() {
  const privata = new Privata({
    // your configuration
  });

  const { userData, loading } = usePrivata(privata, { 
    userId: 'user123' 
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="privacy-app">
      <ConsentBanner privata={privata} />
      
      <PrivacyDashboard 
        userId="user123"
        privata={privata}
        showAdvanced={true}
      />
      
      <DataExportButton 
        userId="user123"
        privata={privata}
        variant="primary"
      />
    </div>
  );
}
```

### Custom Styling

```tsx
import React from 'react';
import { ConsentBanner } from '@privata/react';
import './custom-styles.css';

function App() {
  return (
    <ConsentBanner
      privata={privata}
      className="my-custom-consent-banner"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}
    />
  );
}
```

## 🚀 Getting Started

1. **Install the package:**
   ```bash
   npm install @privata/react @privata/core
   ```

2. **Set up Privata:**
   ```tsx
   import { Privata } from '@privata/core';
   
   const privata = new Privata({
     // your configuration
   });
   ```

3. **Add components to your app:**
   ```tsx
   import { ConsentBanner, PrivacyDashboard } from '@privata/react';
   ```

4. **Customize styling:**
   ```css
   .consent-banner { /* your styles */ }
   .privacy-dashboard { /* your styles */ }
   ```

## 📖 Documentation

- **[Component API](./docs/components.md)** - Complete component reference
- **[Hook API](./docs/hooks.md)** - React hooks documentation
- **[Styling Guide](./docs/styling.md)** - Customization guide
- **[Accessibility](./docs/accessibility.md)** - Accessibility features
- **[Examples](./docs/examples.md)** - Code examples and patterns

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**@privata/react** - Making GDPR/HIPAA compliance invisible to end users since 2026 🚀

