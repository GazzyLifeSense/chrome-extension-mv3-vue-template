<template>
  <h1>Welcome to the options page!</h1>
  <div class="options">
    <!-- 顶部区域 -->
    <div class="header">
      <span class="setting">偏好设置</span>
      <div class="active">
        <span>激活/禁用插件</span>
        <Switch v-model:checked="checked" />
      </div>
    </div>
    <!-- 中部内容区域 -->
    <div class="content"> </div>
  </div>
</template>

<script lang="ts" setup>
  import { Switch } from 'ant-design-vue';
  import { ref } from 'vue';
  const checked = ref<boolean>(true);
</script>
<style lang="less" scoped>
  :global(body){ margin: 0; }
  .options {
    position: relative;
    width: 70%;
    height: 50rem;
    margin: 1rem auto;
    border: 1px solid #ccc;
    .header {
      background: linear-gradient(45deg, black, #00000024);
      color: white;
      line-height: 54px;
      .setting {
        text-align: center;
        font-size: 18px;
        margin-left: 2em;
      }
      .active {
        position: absolute;
        right: 3%;
        display: inline-flex;
        align-items: center;
        span {
          margin-right: 20px;
        }
        .ant-switch.ant-switch-checked{
          background: linear-gradient(45deg, #873fe2, #e2b4e3);
        }
      }
    }
  }
</style>
