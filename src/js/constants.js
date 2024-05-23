export const ENABLE_3D = true;
export const CRASH_3D = false;
export const CRASH_WEBWORKER = false;

export const ACCENT1 = [146, 50, 72];
export const ACCENT2 = [0, 70, 78];

export const NO_TRANSITION_SPEED = 0.0;
export const THEME_TRANSITION_SPEED = 1.0;
export const INTERACTIVE_TRANSITION_SPEED = 0.3;

export const MAIN_LOOP_MS = 25;

CRASH_3D && console.warn("CRASH_3D debug value is on");
CRASH_WEBWORKER && console.warn("CRASH_WEBWORKER debug value is on");
!ENABLE_3D && console.warn("ENABLE_3D debug value is off");
