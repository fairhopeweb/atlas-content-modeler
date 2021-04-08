import {POSITION_GAP} from "../../queries";
import {toast} from 'react-toastify';
import {showError} from "../../toasts";
import React from "react";

const {apiFetch} = wp;

/**
 * Reorders `list` by moving the item at `startIndex` to `endIndex`.
 *
 * @param list
 * @param startIndex
 * @param endIndex
 * @return {Array}
 * @example
 * ```
 * reorder(["a", "b", "c"], 0, 1)); // ["b", "a", "c"]
 * reorder(["a", "b", "c"], 0, 2)); // ["b", "c", "a"]
 * ```
 */
const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

/**
 * Updates field positions in the WordPress database.
 *
 * @return {Promise<void>}
 */
const updatePositions = async (model, idsAndPositions) => {
	await apiFetch({
		path: `/wpe/content-model-fields/${model}`,
		method: "PATCH",
		_wpnonce: wpApiSettings.nonce,
		data: {fields: idsAndPositions},
	});
};

/**
 * Updates the model store and WordPress database when fields are reordered.
 */
export function onDragEnd(result, fields, model, dispatch, models) {
	const {destination, source} = result;

	if (!destination) {
		return;
	}

	if (
		destination.droppableId === source.droppableId
		&& destination.index === source.index
	) {
		return;
	}

	// Store original field order to revert if the position update fails.
	const idsAndOldPositions = fields.reduce((result, id) => {
		result[id] = {position: models[model]['fields'][id]?.position };
		return result;
	}, {});

	const newOrder = reorder(
		fields,
		result.source.index,
		result.destination.index
	);

	let position = 0;
	const idsAndNewPositions = newOrder.reduce((result, id) => {
		result[id] = {position};
		position += POSITION_GAP;
		return result;
	}, {});

	// Optimistically update the client-side model store so the new field order is rendered immediately.
	dispatch({type: 'reorderFields', positions: idsAndNewPositions, model: model});

	updatePositions(model, idsAndNewPositions)
		.then((res) => {
			toast.dismiss("error");
		})
		.catch((err) => {
			showError(
				`Error saving field order: “${
					err?.message || "Error unknown."
				}” Close this and try again?`
			);

			// Revert local field order so the state is accurate and the user can retry.
			dispatch({type: 'reorderFields', positions: idsAndOldPositions, model: model});
		});
}
