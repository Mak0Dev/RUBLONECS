<script lang="ts">
	import Main from "../components/templates/Main.svelte";
	import request from "../lib/request";
	import * as rank from "../stores/rank";

	let url = "";
	let disabled = false;
	let errorMessage: string | undefined;
	let copiedAssetIds: number[] = [];

	rank.promise.then(() => {
		if (!rank.hasPermission("CreateBundleCopiedFromRoblox")) {
			errorMessage = "You don't have permission to copy animation bundles.";
			disabled = true;
		}
	});

	async function copyBundle() {
		errorMessage = undefined;
		copiedAssetIds = [];
		const match = url.match(/\d+/);
		if (!match) {
			errorMessage = "Enter a valid Roblox animation bundle URL or bundle ID.";
			return;
		}

		disabled = true;
		try {
			const response = await request.post(`/bundle/copy-animation-bundle?bundleId=${parseInt(match[0], 10)}`, {});
			copiedAssetIds = response.data.assetIds || [];
			if (copiedAssetIds.length === 0) {
				errorMessage = "No animation assets were found in this bundle.";
			}
		} catch (error: any) {
			errorMessage = error.response?.data?.error || error.message || "Failed to copy animation bundle.";
		} finally {
			disabled = false;
		}
	}
</script>

<svelte:head>
	<title>Copy Roblox Animation Bundle</title>
</svelte:head>

<Main>
	<div class="row">
		<div class="col-12">
			<h1>Copy Roblox Animation Bundle</h1>
			{#if errorMessage}<div class="alert alert-danger">{errorMessage}</div>{/if}
			{#each copiedAssetIds as assetId}
				<p><a href={`/catalog/${assetId}/--`}>View copied animation #{assetId}</a> · <a href={`/admin/product/update?assetId=${assetId}`}>Update Product</a></p>
			{/each}
		</div>
		<div class="col-12">
			<label for="url">Roblox URL or Bundle ID</label>
			<input type="text" class="form-control" id="url" bind:value={url} disabled={disabled} placeholder="https://www.roblox.com/bundles/123/..." />
		</div>
		<div class="col-6 mt-4">
			<button class="btn btn-success" disabled={disabled || !url} on:click|preventDefault={copyBundle}>
				{disabled ? "Copying..." : "Copy Animations"}
			</button>
		</div>
	</div>
</Main>

<style>
	.alert { margin-bottom: 1rem; }
</style>
