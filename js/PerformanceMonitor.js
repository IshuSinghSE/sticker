/**
 * Performance Monitoring - Core Web Vitals
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // Monitor Core Web Vitals
    this.measureCLS();
    this.measureLCP();
    this.measureFID();
    this.measureTTFB();
    this.measureFCP();
    
    // Monitor PWA specific metrics
    this.measureServiceWorkerRegistration();
    this.measureCachePerformance();
  }

  measureCLS() {
    // Cumulative Layout Shift
    let clsValue = 0;
    let clsEntries = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }
      this.metrics.cls = clsValue;
      this.reportMetric('CLS', clsValue);
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  }

  measureLCP() {
    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.metrics.lcp = lastEntry.startTime;
      this.reportMetric('LCP', lastEntry.startTime);
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  measureFID() {
    // First Input Delay
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.fid = entry.processingStart - entry.startTime;
        this.reportMetric('FID', this.metrics.fid);
      }
    });

    observer.observe({ type: 'first-input', buffered: true });
  }

  measureTTFB() {
    // Time to First Byte
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === location.origin) {
          this.metrics.ttfb = entry.responseStart - entry.requestStart;
          this.reportMetric('TTFB', this.metrics.ttfb);
        }
      }
    });

    observer.observe({ type: 'navigation', buffered: true });
  }

  measureFCP() {
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.fcp = entry.startTime;
        this.reportMetric('FCP', entry.startTime);
      }
    });

    observer.observe({ type: 'paint', buffered: true });
  }

  measureServiceWorkerRegistration() {
    // Service Worker registration time
    if ('serviceWorker' in navigator) {
      const startTime = performance.now();
      
      navigator.serviceWorker.ready.then(() => {
        const registrationTime = performance.now() - startTime;
        this.metrics.swRegistration = registrationTime;
        this.reportMetric('SW Registration', registrationTime);
      });
    }
  }

  measureCachePerformance() {
    // Cache hit/miss ratio
    if ('caches' in window) {
      const startTime = performance.now();
      
      caches.open('sticker-cropper-v1.0.0').then((cache) => {
        const cacheTime = performance.now() - startTime;
        this.metrics.cacheAccess = cacheTime;
        this.reportMetric('Cache Access', cacheTime);
      });
    }
  }

  reportMetric(name, value) {
    // Report to console for development
    console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    
    // In production, you would send this to your analytics service
    // this.sendToAnalytics(name, value);
  }

  sendToAnalytics(name, value) {
    // Send to Google Analytics, PostHog, or your analytics service
    // Example for Google Analytics 4:
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_parameter: 'sticker_cropper'
      });
    }
  }

  getMetrics() {
    return this.metrics;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.metrics,
      performance: {
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : null,
        memory: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null
      }
    };

    console.log('Performance Report:', report);
    return report;
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  window.performanceMonitor = new PerformanceMonitor();
  
  // Generate report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.performanceMonitor.generateReport();
    }, 5000); // Wait 5 seconds for metrics to settle
  });
}
