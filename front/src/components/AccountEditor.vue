<template>
  <v-card width="400" class="mt-1">
    <v-card-title>Учетная запись</v-card-title>
    <v-card-subtitle>
      Управление учетной записью
    </v-card-subtitle>
    <v-card-text>
      Электронный почтовый ящик:
      <div class="d-flex align-start">
        <span id="usernm" class="text-subtitle-1 font-weight-medium">{{ getUser().email }}</span>
<!--        <edit-some/>-->
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer/>
      <delete-account/>
    </v-card-actions>
  </v-card>
</template>

<script>
import {mapGetters} from "vuex";
// import EditSome from "./modal/EditSome"
import DeleteAccount from "./modal/DeleteAccount"

export default {
  name: "AccountEditor",
  // components: {EditSome, DeleteAccount},
  components: {DeleteAccount},
  data: ()=>({
    is_edited: false
  }),
  methods:{
    ...mapGetters(['getUser',]),
  },
}
</script>

<style scoped>
  #usernm{
    border-bottom: solid 1px #b5b5b5;
    flex: 1 0 auto;
  }
</style>