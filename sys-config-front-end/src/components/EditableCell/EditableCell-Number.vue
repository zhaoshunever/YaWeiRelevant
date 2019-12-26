<template>
  <div class="editable-cell">
    <div
      v-if="editable"
      class="editable-cell-input-wrapper"
    >
      <a-input-number :min="1" :max="100" v-model="value" 
      @change="handleChange"
      @pressEnter="check" 
      />
      <a-icon
        type="check"
        class="editable-cell-icon-check"
        @click="check"
      />
    </div>
    <div
      v-else
      class="editable-cell-text-wrapper"
    >
      {{ value || ' ' }}
      <a-icon
        type="edit"
        class="editable-cell-icon"
        @click="edit"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    text: Number,
  },
  data () {
    return {
      value: this.text,
      editable: false,
    };
  },
  methods: {
    handleChange (e) {
      //console.log(e);
      const value = e;
      this.value = value;
    },
    check () {
      this.$emit('change', this.value);
      this.editable = false;
    },
    edit () {
      //console.log("edit");
      this.editable = true;
    },
  },
};
</script>