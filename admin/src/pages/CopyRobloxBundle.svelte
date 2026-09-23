<script lang="ts">
	import { link } from "svelte-routing";
	import Main from "../components/templates/Main.svelte";
	import request from "../lib/request";
	import * as rank from "../stores/rank";

	let url = "";
	let disabled = false;
	let errorMessage: string | undefined;
	let createdAssetId: number | undefined;

	rank.promise.then(() => {
		if (!rank.hasPermission("CreateBundleCopiedFromRoblox")) {
			errorMessage = "You don't have permission to copy bundles.";
			disabled = true;
		}
	});

	async function copyBundle() {
		errorMessage = undefined;
		createdAssetId = undefined;
		const match = url.match(/\d+/);
		if (!match) {
			errorMessage = "Enter a valid Roblox bundle URL or bundle ID.";
			return;
		}

		disabled = true;
		try {
			const response = await request.post(`/bundle/copy-from-roblox?bundleId=${parseInt(match[0], 10)}`, {});
			createdAssetId = response.data.assetId;
		} catch (error: any) {
			errorMessage = error.response?.data?.error || error.message || "Failed to copy bundle.";
		} finally {
			disabled = false;
		}
	}
</script>

<svelte:head>
	<title>Copy Roblox Bundle</title>
</svelte:head>

<Main>
	<div class="row">
		<div class="col-12">
			<h1>Copy Roblox Bundle</h1>
			{#if errorMessage}<div class="alert alert-danger">{errorMessage}</div>{/if}
			{#if createdAssetId !== undefined}
				<p>Link: <a href={`/catalog/${createdAssetId}/--`}>View on site</a></p>
				<p>Product: <a use:link href={`/admin/product/update?assetId=${createdAssetId}`}>Update Product</a></p>
			{/if}
		</div>
		<div class="col-12">
			<label for="url">Roblox URL or Bundle ID</label>
			<input type="text" class="form-control" id="url" bind:value={url} disabled={disabled} placeholder="https://www.roblox.com/bundles/123/..." />
		</div>
		<div class="col-6 mt-4">
			<button class="btn btn-success" disabled={disabled || !url} on:click|preventDefault={copyBundle}>
				{disabled ? "Copying..." : "Create Bundle"}
			</button>
		</div>
	</div>
</Main>
