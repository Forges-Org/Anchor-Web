// ─── Constants ───────────────────────────────────────────────────────────────

const STELLAR_PUBLIC_KEY_PREFIX = "G" as const;
const STELLAR_SECRET_KEY_PREFIX = "S" as const;
const STELLAR_PUBLIC_KEY_LENGTH = 56;
const STELLAR_SECRET_KEY_LENGTH = 56;
const STELLAR_BASE32_REGEX = /^[A-Z2-7]+$/;
const STELLAR_MEMO_MAX_LENGTH = 28; // Stellar memo text max bytes

// ─── Types ───────────────────────────────────────────────────────────────────

export type StellarAddressType = "public" | "secret" | "unknown";

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

export interface AddressInfo {
	raw: string;
	truncated: string;
	type: StellarAddressType;
	isValid: boolean;
}

export interface TruncateOptions {
	prefixLength?: number;
	suffixLength?: number;
	separator?: string;
}

// ─── Address Formatting ──────────────────────────────────────────────────────

/**
 * Truncates a long Stellar address string for display.
 *
 * @example
 * truncateAddress("GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI")
 * // → "GBZXN7...MADI"
 *
 * truncateAddress("GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI", {
 *   prefixLength: 8,
 *   suffixLength: 6,
 *   separator: "••••"
 * })
 * // → "GBZXN7PI••••NMADI"
 */
export function truncateAddress(
	address: string,
	options: TruncateOptions = {},
): string {
	const { prefixLength = 6, suffixLength = 4, separator = "..." } = options;

	const trimmed = address.trim();
	const minLength = prefixLength + suffixLength;

	if (!trimmed || trimmed.length <= minLength) return trimmed;

	return `${trimmed.slice(0, prefixLength)}${separator}${trimmed.slice(-suffixLength)}`;
}

/**
 * Formats a Stellar address with consistent spacing for UI display.
 * Groups characters into readable chunks.
 *
 * @example
 * formatAddress("GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI")
 * // → "GBZXN7 PIRZGN MHGA7M UUUF4G WPY5AY PV6LY4 UV2GL6 VJGIQR XFDNMA DI"
 */
export function formatAddress(address: string, chunkSize = 6): string {
	const trimmed = address.trim();
	if (!trimmed) return "";

	const chunks: string[] = [];
	for (let i = 0; i < trimmed.length; i += chunkSize) {
		chunks.push(trimmed.slice(i, i + chunkSize));
	}
	return chunks.join(" ");
}

/**
 * Copies a Stellar address to the clipboard.
 * Returns whether the operation succeeded.
 */
export async function copyAddressToClipboard(
	address: string,
): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(address.trim());
		return true;
	} catch {
		return false;
	}
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Validates a Stellar public key (G-address).
 * Stellar public keys are 56 characters, start with 'G', and use base32 alphabet.
 *
 * @example
 * validateStellarAddress("GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI")
 * // → { valid: true }
 */
export function validateStellarAddress(address: string): ValidationResult {
	const trimmed = address.trim();

	if (!trimmed) {
		return { valid: false, error: "Address is required." };
	}

	if (!trimmed.startsWith(STELLAR_PUBLIC_KEY_PREFIX)) {
		return {
			valid: false,
			error: `Stellar public keys must start with '${STELLAR_PUBLIC_KEY_PREFIX}'.`,
		};
	}

	if (trimmed.length !== STELLAR_PUBLIC_KEY_LENGTH) {
		return {
			valid: false,
			error: `Address must be ${STELLAR_PUBLIC_KEY_LENGTH} characters (got ${trimmed.length}).`,
		};
	}

	if (!STELLAR_BASE32_REGEX.test(trimmed)) {
		return {
			valid: false,
			error: "Address contains invalid characters (must be A-Z or 2-7).",
		};
	}

	return { valid: true };
}

/**
 * Validates a Stellar secret key (S-address).
 * Secret keys are 56 characters, start with 'S', and use base32 alphabet.
 *
 * @example
 * validateStellarSecretKey("SCZANGBA5AAOFISZTLVMC73LCGLA5WZGTBPQBQM3ODNPVLVPW726HDKZ")
 * // → { valid: true }
 */
export function validateStellarSecretKey(secretKey: string): ValidationResult {
	const trimmed = secretKey.trim();

	if (!trimmed) {
		return { valid: false, error: "Secret key is required." };
	}

	if (!trimmed.startsWith(STELLAR_SECRET_KEY_PREFIX)) {
		return {
			valid: false,
			error: `Stellar secret keys must start with '${STELLAR_SECRET_KEY_PREFIX}'.`,
		};
	}

	if (trimmed.length !== STELLAR_SECRET_KEY_LENGTH) {
		return {
			valid: false,
			error: `Secret key must be ${STELLAR_SECRET_KEY_LENGTH} characters (got ${trimmed.length}).`,
		};
	}

	if (!STELLAR_BASE32_REGEX.test(trimmed)) {
		return {
			valid: false,
			error: "Secret key contains invalid characters (must be A-Z or 2-7).",
		};
	}

	return { valid: true };
}

/**
 * Validates a Stellar transaction memo (text type).
 * Memo text must be a non-empty UTF-8 string up to 28 bytes.
 */
export function validateMemo(memo: string): ValidationResult {
	if (!memo) return { valid: true }; // memo is optional

	const byteLength = new TextEncoder().encode(memo).length;

	if (byteLength > STELLAR_MEMO_MAX_LENGTH) {
		return {
			valid: false,
			error: `Memo must be at most ${STELLAR_MEMO_MAX_LENGTH} bytes (got ${byteLength}).`,
		};
	}

	return { valid: true };
}

/**
 * Validates a Stellar amount string.
 * Must be a positive number with up to 7 decimal places (Stellar's precision).
 */
export function validateAmount(amount: string): ValidationResult {
	const trimmed = amount.trim();

	if (!trimmed) {
		return { valid: false, error: "Amount is required." };
	}

	const num = parseFloat(trimmed);

	if (isNaN(num) || !isFinite(num)) {
		return { valid: false, error: "Amount must be a valid number." };
	}

	if (num <= 0) {
		return { valid: false, error: "Amount must be greater than zero." };
	}

	// Stellar supports up to 7 decimal places (stroops)
	if (!/^\d+(\.\d{1,7})?$/.test(trimmed)) {
		return {
			valid: false,
			error: "Amount supports up to 7 decimal places.",
		};
	}

	return { valid: true };
}

// ─── Address Utilities ───────────────────────────────────────────────────────

/**
 * Detects the type of a Stellar key from its prefix.
 */
export function getStellarAddressType(address: string): StellarAddressType {
	const trimmed = address.trim();
	if (trimmed.startsWith(STELLAR_PUBLIC_KEY_PREFIX)) return "public";
	if (trimmed.startsWith(STELLAR_SECRET_KEY_PREFIX)) return "secret";
	return "unknown";
}

/**
 * Returns full address info — type, truncated form, and validity — in one call.
 *
 * @example
 * getAddressInfo("GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI")
 * // → { raw: "GBZXN7...", truncated: "GBZXN7...MADI", type: "public", isValid: true }
 */
export function getAddressInfo(address: string): AddressInfo {
	const trimmed = address.trim();
	const type = getStellarAddressType(trimmed);
	const validation =
		type === "public"
			? validateStellarAddress(trimmed)
			: type === "secret"
				? validateStellarSecretKey(trimmed)
				: { valid: false };

	return {
		raw: trimmed,
		truncated: truncateAddress(trimmed),
		type,
		isValid: validation.valid,
	};
}

/**
 * Compares two Stellar addresses for equality (case-insensitive, trimmed).
 */
export function isSameAddress(a: string, b: string): boolean {
	return a.trim().toUpperCase() === b.trim().toUpperCase();
}

/**
 * Checks whether a string looks like any valid Stellar key
 * without running full validation — useful for quick UI hints.
 */
export function looksLikeStellarAddress(value: string): boolean {
	const trimmed = value.trim();
	return (
		(trimmed.startsWith(STELLAR_PUBLIC_KEY_PREFIX) ||
			trimmed.startsWith(STELLAR_SECRET_KEY_PREFIX)) &&
		trimmed.length === STELLAR_PUBLIC_KEY_LENGTH &&
		STELLAR_BASE32_REGEX.test(trimmed)
	);
}

/**
 * Masks a secret key for safe display — never expose full secret keys in UI.
 *
 * @example
 * maskSecretKey("SCZANGBA5AAOFISZTLVMC73LCGLA5WZGTBPQBQM3ODNPVLVPW726HDKZ")
 * // → "SCZANG••••••••••••••••••••••••••••••••••••••••••••HDKZ"
 */
export function maskSecretKey(secretKey: string): string {
	const trimmed = secretKey.trim();
	if (trimmed.length <= 10) return "•".repeat(trimmed.length);
	return `${trimmed.slice(0, 6)}${"•".repeat(trimmed.length - 10)}${trimmed.slice(-4)}`;
}
