<template>
  <v-row class="placeholder pulser" :class="{factory}">
    <div class="header">
      <v-col cols="8">
        <template v-if="factory">
          <div class="title pulser" />
          <div class="badges mt-1">
            <div class="badge pulser" />
            <div class="badge pulser" />
            <div class="badge pulser" />
          </div>
        </template>
      </v-col>
      <v-col class="d-flex align-center justify-end" cols="4">
        <div class="buttons">
          <template v-if="factory">
            <div class="button square pulser" />
            <div class="button square pulser" />
            <div class="button square pulser" />
            <div class="button square pulser" />
            <div class="button square pulser" />
          </template>
          <template v-if="!factory">
            <div class="button pulser" />
          </template>
        </div>
      </v-col>
    </div>
    <v-col v-if="factory" class="content" cols="12" />
  </v-row>
</template>

<script lang="ts" setup>
  defineProps<{
    factory?: boolean
  }>()

</script>

<style lang="scss">
.pulser {
  background: linear-gradient(90deg, #404040, #636363, #515151);
  background-size: 200% 100%;
  animation: loadingPattern 1.5s infinite linear;
}

.placeholder {
  width: 100%;
  border-radius: 3px;
  align-content: center;
  border: 2px solid #636363;
  margin: 0 0 24px 0;
  min-height: 77px;

  .header {
    width: 100%;
    display: flex;
    align-content: center;
  }

  .buttons {
    float: right;
    display: flex;
    justify-content: end;
    width: 300px;

    .button {
      width: 105px;
      height: 38px;
      border-radius: 4px;
      border: #7f7f7f 1px solid;
      margin-left: 8px;

      &.square {
        width: 38px;
      }
    }
  }

  .content {
    height: 150px;
  }

  .title {
    height: 60px;
    width: 400px;
  }

  .badges {
    width: 320px;
    display: flex;
    justify-content: space-between;
    margin-top: 8px;

    .badge {
      height: 32px;
      width: 100px;
      margin-right: 5px;
      border-radius: 20px;
      border: #7f7f7f 1px solid;
    }
  }

  &.factory {
    .header {
      border-bottom: 1px solid #7f7f7f;
    }
  }
}

@keyframes loadingPattern {
  0% {
    background-position: 200% 0%;
  }
  100% {
    background-position: 0% 0%;
  }
}
</style>
