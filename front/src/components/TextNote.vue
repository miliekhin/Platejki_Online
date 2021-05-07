<template>
<div>
  <v-card width="400" class="mt-1">
    <v-card-title>Текстовая заметка</v-card-title>
    <v-card-subtitle>
      Добавьте любой текст или напоминание для себя. Например, текущие тарифы.
    </v-card-subtitle>
    <v-card-text class="pb-0">
      <textarea maxlength="1024" spellcheck="false" v-model="text"></textarea>
    </v-card-text>
    <v-card-actions>
      <v-switch hide-details
                v-model="switch_show"
                label="Показать на странице с платежками"
                class="ml-2 mt-0 py-3"
                @click="saveSwitch"
      ></v-switch>
    </v-card-actions>
  </v-card>
</div>
</template>

<script>
import _ from 'lodash'
export default {
  name: "TextNote",
      data: ()=>({
        switch_show: false,
        text: '',
        unwatch: undefined,
    }),
  created() {
    this.debouncedSave = _.debounce(this.saveNoteText, 1000)
  },
  mounted() {
    this.text = this.$store.getters.getZomedkoData.zametka
    this.switch_show = this.$store.getters.getZomedkoData.show
    this.unwatch = this.$watch('text', this.dataWatcher);
  },
  methods:{
    saveSwitch(){
      this.$store.dispatch('showZomedko', this.switch_show)
    },
    saveNoteText(){
      this.$store.dispatch('saveZomedkoText', this.text)
    },
    dataWatcher(){
        this.debouncedSave()
    },
  }

}
</script>

<style scoped>
  textarea{
    height: 15em;
    width: 100%;
    font-size: small;
    line-height: 1rem;
    resize: none;
    outline: none;
    background-color: #FFECB3;
    padding: 5px 7px;
    /*border: 1px lightgray solid;*/
    box-shadow: inset 0 0 2px 0 rgba(0,0,0,0.75);
  }
</style>