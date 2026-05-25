import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getThemePreference,
  setThemePreference,
  resolveTheme,
  applyTheme,
} from "../../src/core/theme";

describe("getThemePreference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to system when nothing is stored", () => {
    expect(getThemePreference()).toBe("system");
  });

  it("returns stored light preference", () => {
    localStorage.setItem("p-xing.theme", "light");
    expect(getThemePreference()).toBe("light");
  });

  it("returns stored dark preference", () => {
    localStorage.setItem("p-xing.theme", "dark");
    expect(getThemePreference()).toBe("dark");
  });

  it("returns stored system preference", () => {
    localStorage.setItem("p-xing.theme", "system");
    expect(getThemePreference()).toBe("system");
  });

  it("falls back to system for an unknown stored value", () => {
    localStorage.setItem("p-xing.theme", "rainbow");
    expect(getThemePreference()).toBe("system");
  });

  it("falls back to system when localStorage throws", () => {
    const spy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("unavailable");
      });
    expect(getThemePreference()).toBe("system");
    spy.mockRestore();
  });
});

describe("setThemePreference", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("persists the preference so getThemePreference reads it back", () => {
    setThemePreference("light");
    expect(getThemePreference()).toBe("light");

    setThemePreference("dark");
    expect(getThemePreference()).toBe("dark");
  });

  it("applies data-theme to the html element", () => {
    setThemePreference("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("still applies the theme when localStorage throws", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("unavailable");
      });
    setThemePreference("light");
    // Theme should still be applied even without localStorage
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    spy.mockRestore();
  });
});

describe("resolveTheme", () => {
  it("returns light for explicit light", () => {
    expect(resolveTheme("light")).toBe("light");
  });

  it("returns dark for explicit dark", () => {
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("returns light for system when dark mode is off", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    expect(resolveTheme("system")).toBe("light");
    vi.restoreAllMocks();
  });

  it("returns dark for system when dark mode is on", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    expect(resolveTheme("system")).toBe("dark");
    vi.restoreAllMocks();
  });
});

describe("applyTheme", () => {
  it("sets data-theme=light on the html element", () => {
    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("sets data-theme=dark on the html element", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
