import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatTimestamp,
  formatDate,
  formatISOString,
  getCountdown,
} from "../dateUtils";

describe("dateUtils", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatTimestamp", () => {
    it("formats unix timestamps into readable strings", () => {
      const result = formatTimestamp(1704067200);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("handles unix epoch", () => {
      const result = formatTimestamp(0);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("handles far future timestamps", () => {
      const result = formatTimestamp(4102444800);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });
  });

  describe("formatDate", () => {
    it("formats unix timestamps into readable dates", () => {
      const result = formatDate(1704067200);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("handles unix epoch", () => {
      const result = formatDate(0);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });
  });

  describe("formatISOString", () => {
    it("formats valid ISO strings", () => {
      const result = formatISOString("2026-02-10T14:32:00Z");

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("returns original value for invalid ISO strings", () => {
      const invalid = "not-a-date";

      expect(formatISOString(invalid)).toBe(invalid);
    });
  });

  describe("getCountdown", () => {
    it("returns null when timestamp has passed", () => {
      vi.spyOn(Date, "now").mockReturnValue(1000 * 1000);

      expect(getCountdown(999)).toBeNull();
    });

    it("formats seconds correctly", () => {
      vi.spyOn(Date, "now").mockReturnValue(1000 * 1000);

      expect(getCountdown(1030)).toBe("30s");
    });

    it("formats minutes and seconds correctly", () => {
      vi.spyOn(Date, "now").mockReturnValue(1000 * 1000);

      expect(getCountdown(1090)).toBe("1m 30s");
    });

    it("formats hours, minutes and seconds correctly", () => {
      vi.spyOn(Date, "now").mockReturnValue(1000 * 1000);

      expect(getCountdown(4690)).toBe("1h 1m 30s");
    });

    it("formats days, hours, minutes and seconds correctly", () => {
      vi.spyOn(Date, "now").mockReturnValue(1000 * 1000);

      expect(getCountdown(91930)).toBe("1d 1h 15m 30s");
    });
  });
});