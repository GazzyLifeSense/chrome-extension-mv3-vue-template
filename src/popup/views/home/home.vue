<script lang="ts" setup>
function getExtensionUrl(path: string) {
    return chrome.runtime.getURL(path);
}
</script>

<template>
    <div class="P-home">
        <h1>Home Page</h1>
        <a href="https://github.com/GazzyLifesense" target="_blank">
            <img src="@/assets/logo.jpg" class="logo" />
        </a>
        <p></p>
        <a :href="getExtensionUrl('src/options/index.html')" target="_blank">
            Open options page
        </a>
    </div>
</template>

<style scoped lang="less">
.P-home{
    text-align: center;
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    background: linear-gradient(#f48c8d,#f4c58d);
    h1{
        margin-top: 50px;
        text-align: center;
        color: #fff;
        font-size: 40px;}}
.logo {
  margin-left: auto;
  margin-right: auto;
  height: 8em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #9dff94ce);
}
</style>