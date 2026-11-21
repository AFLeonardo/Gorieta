import * as SplashScreen from "expo-splash-screen";
import { useCallback, useState } from "react";

import AnimatedSplash from "@/components/animated-splash";
import AppTabs from "@/components/app-tabs";

SplashScreen.preventAutoHideAsync();

// A nivel de módulo (no estado del componente): el splash animado solo se muestra una vez
// por arranque de la app, aunque este layout se vuelva a montar al navegar.
let splashShown = false;

export default function TabLayout() {
  const [splashDone, setSplashDone] = useState(splashShown);

  const handleReady = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);
  const handleFinish = useCallback(() => {
    splashShown = true;
    setSplashDone(true);
  }, []);

  if (!splashDone) {
    return <AnimatedSplash onReady={handleReady} onFinish={handleFinish} />;
  }

  return <AppTabs />;
}
