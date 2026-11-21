import * as SplashScreen from "expo-splash-screen";
import { useCallback, useState } from "react";

import AnimatedSplash from "@/components/animated-splash";
import AppTabs from "@/components/app-tabs";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [splashDone, setSplashDone] = useState(false);

  const handleReady = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);
  const handleFinish = useCallback(() => setSplashDone(true), []);

  if (!splashDone) {
    return <AnimatedSplash onReady={handleReady} onFinish={handleFinish} />;
  }

  return <AppTabs />;
}
