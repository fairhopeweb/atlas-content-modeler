<?php
/**
 * Utility and helper functions
 *
 * @package AtlasContentModeler
 */

declare(strict_types=1);

namespace WPE\AtlasContentModeler\API;

/**
 * Create a new array with keys from given array of keys.
 *
 * @param array<int|string,mixed> $array Associative array of data.
 * @param array<int,int|string>   $keys  Array of keys to extract.
 *
 * @return array Array of extracted keys and values.
 */
function array_extract_by_keys( array $array, array $keys ): array {
	return \array_intersect_key(
		$array,
		\array_flip( $keys )
	);
}

/**
 * Create a new array with the given keys values removed.
 *
 * @param array<int|string,mixed> $array Associative array of data.
 * @param array<int,int|string>   $keys  Array of keys to remove.
 *
 * @return array Array with key values removed.
 */
function array_remove_by_keys( array $array, array $keys ): array {
	return \array_diff_key(
		$array,
		\array_flip( $keys )
	);
}