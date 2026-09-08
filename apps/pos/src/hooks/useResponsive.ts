import { useMediaQuery } from "@mantine/hooks"

export function useResponsive() {
  const isMobile = useMediaQuery("(max-width: 767px)") ?? false
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)") ?? false
  const isDesktop = useMediaQuery("(min-width: 1024px)") ?? true

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen: isMobile || isTablet,
  }
}

