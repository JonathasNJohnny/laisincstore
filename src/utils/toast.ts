export const TOAST_EVENT = "laisinc:toast";
export const OPEN_LOGIN_MENU_EVENT = "laisinc:open-login-menu";

export type ToastType = "warn";

export interface ToastDetail {
  type: ToastType;
  message: string;
}

export const toast = {
  warn(message: string) {
    window.dispatchEvent(
      new CustomEvent<ToastDetail>(TOAST_EVENT, {
        detail: { type: "warn", message },
      }),
    );
  },
};

export function openLoginMenu() {
  window.dispatchEvent(new CustomEvent(OPEN_LOGIN_MENU_EVENT));
}
