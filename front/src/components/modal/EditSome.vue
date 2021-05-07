<template>
<div>
  <v-dialog persistent v-model="show_dlg" width="320"
          @keydown.esc.prevent="onCancel()"
          @keydown.enter.prevent="onApply()">
    <template v-slot:activator="{ on, attrs }">
      <v-hover v-slot:default="{ hover }">
        <v-btn
            icon
            small
            tile
            title="Изменить"
            id="bbtn"
            class="ml-1"
            elevation="2"
            @click="onOpen()"
            v-bind="attrs"
            v-on="on"
        >
          <v-icon :color="hover ? 'green' : 'default'">mdi-pencil</v-icon>
        </v-btn>
      </v-hover>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Имя пользователя</span>
      </v-card-title>

      <v-card-text>
        <p class="body-1">Имя пользователя не связано с логином или адресом электронной почты.
          Здесь можно ввести, например, свою фамилию и инициалы.
        </p>
        <v-row justify="center">
          <v-text-field
              autofocus
              autocomplete="off"
              v-model="new_value"
          />
        </v-row>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="onCancel()">Отмена</v-btn>
        <v-btn text color="primary" :disabled="!new_value.length" @click="onApply()">Продолжить</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "EditSome",
  data: ()=>({
    init_value: '',
    new_value: '',
    show_dlg: false,
  }),
  methods:{
    ...mapGetters(['getUser',]),
    onCancel() {
      this.show_dlg = false
    },
    onApply(){
      if(!this.new_value.length)
        return
      this.show_dlg = false
      if(this.init_value === this.new_value)
        return

      this.$store.dispatch('changeUserName', this.new_value )
    },
    onOpen(){
      this.init_value = this.new_value = this.getUser().username

    },
  },

}
</script>

<style scoped>

</style>