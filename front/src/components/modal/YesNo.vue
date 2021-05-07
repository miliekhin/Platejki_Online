<template>
<div>
  <v-dialog persistent max-width="400"
            v-model="prop_show"
          @keydown.esc.prevent="onNo()"
          @keydown.enter.prevent="onYes()">
<!--    <template v-slot:activator="{ on, attrs }">-->
<!--      <v-btn-->
<!--          small-->
<!--          @click="onOpen()"-->
<!--          v-bind="attrs"-->
<!--          v-on="on"-->
<!--      >-->
<!--        {{ btn_txt }}-->
<!--      </v-btn>-->
<!--    </template>-->
    <v-card>
      <v-card-title>
        <span class="headline text-center">{{prop_head_txt}}</span>
      </v-card-title>

      <v-card-text class="text--primary" v-html="prop_body_txt"/>
      <v-divider/>

      <v-card-actions>
        <v-spacer/>
        <v-btn text @click="onNo()">Нет</v-btn>
        <v-btn text color="primary" @click="onYes()">Да</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</div>
</template>

<script>
export default {
name: "YesNo",
  props: ['prop_head_txt', 'prop_body_txt', 'prop_show', 'prop_confirm_event'],
  methods:{
    onYes(){
      this.$emit(this.prop_confirm_event)
    },
    onNo(){
      this.$emit('yes_no_rejected')
    }
  },
}
</script>

<style scoped>

</style>