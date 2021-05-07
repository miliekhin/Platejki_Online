<template>
  <div class="note" id="note" :style="note_pos" ref="fnote">
    <div class="note_bar" id="note_bar">
      <div class="nbtn" :title="button_min.title" @click="onMinimiza()" v-html="button_min.symbol"></div>
      заметка
      <div class="nbtn" title="Закрыть" @click="closeNote()">&#10006;</div>
    </div>
    <div v-html="note_txt" class="note_text" id="note_text"></div>
    <div v-if="!button_min.minimized" class="resizer" id="resizer">
      <v-icon style="top: -10px; left: -13px">mdi-resize-bottom-right</v-icon>
    </div>
  </div>

</template>

<script>
//import VueDraggableResizable from 'vue-draggable-resizable'
export default {
  name: "FlyingNote",
  components: {
    //VueDraggableResizable,
  },
  data: () => ({
    button_min: {symbol: '&mdash;',
      title: 'Свернуть',
      minimized: false,
      old_h: '',
      old_w: '',
    },
    note_txt: '',
    note_pos:{top: '', left: '', width: '', height: ''}
    //noteData: false,
  }),
  mounted() {
    let nd = this.$store.getters.getZomedkoData
    // console.log('zomedko state:', nd)
    this.note_pos.top = nd.top + 'px'
    let l = nd.left
    if( l > window.innerWidth ) l = window.innerWidth - 128
    this.note_pos.left = l + 'px'
    this.note_pos.width = nd.width + 'px'
    this.note_pos.height = nd.height + 'px'
    this.note_txt = nd.zametka.replace(/\n/g, '<br>')
    this.button_min.old_h = nd.old_height + 'px'
    this.button_min.old_w = nd.old_width + 'px'
    let el_note = document.getElementById('note')
    if ( nd.height === 25 ){
      this.button_min.minimized = true
      el_note.style.minWidth = el_note.style.minHeight = '0'
    }
    else{
      el_note.style.minWidth = '200px'
      el_note.style.minHeight = '100px'
    }
    this.setTitle()
    this.setResizing()
    this.setDragging()
    window.addEventListener("resize", this.onWndResize)
  },
  destroyed() {
    window.removeEventListener("resize", this.onWndResize)
  },
  methods: {
    onWndResize(){
      let l = parseInt(this.$refs.fnote.style.left)
      // console.log('Zametka event:', l)
      if( l > window.innerWidth-128 ){
        l = window.innerWidth - 128
        this.$refs.fnote.style.left = l + 'px'
      }
    },
    setTitle(){
      this.button_min.symbol = (this.button_min.minimized ? '&#10010;' : '&mdash;')
      this.button_min.title = (this.button_min.minimized ? 'Развернуть' : 'Свернуть')
    },
    onMinimiza(){
      let el_note = document.getElementById('note')
      if( !this.button_min.minimized ) {
        this.button_min.old_h = el_note.style.height
        this.button_min.old_w = el_note.style.width
        el_note.style.minWidth = el_note.style.minHeight = '0'
        el_note.style.height = '25px'
        el_note.style.width = '120px'
      }else{
        el_note.style.height = this.button_min.old_h
        el_note.style.width = this.button_min.old_w
        el_note.style.minWidth = '200px'
        el_note.style.minHeight = '100px'
      }
      this.button_min.minimized = !this.button_min.minimized
      if ( !this.button_min.minimized ){
        this.$nextTick(() => {
          this.setResizing()
        })
      }
      this.setTitle()
      this.$store.dispatch('saveZomedkoSize', {
        width: parseInt(el_note.style.width),
        height: parseInt(el_note.style.height),
        old_width: parseInt(this.button_min.old_w),
        old_height: parseInt(this.button_min.old_h),
      })

    },
    closeNote(){
      this.$store.dispatch('showZomedko', false)
    },
    setDragging() {
      let vue_obj = this
      let el_note = document.getElementById('note')
      let el_note_bar = document.getElementById('note_bar')
      el_note_bar.addEventListener('mousedown', onMiceDown)

      function onMiceDown(e) {
        window.addEventListener('mousemove', onMiceMove)
        window.addEventListener('mouseup', onMiceUp)
        let prevX = e.clientX
        let prevY = e.clientY

        function onMiceMove(e) {
          let newX = prevX - e.clientX;
          let newY = prevY - e.clientY;

          const rect = el_note.getBoundingClientRect();
          let rl = rect.left - newX
          let rt = rect.top - newY
          if( rl <= 0 ) rl = 1
          if( rt <= 0 ) rt = 1
          if ( rl > window.innerWidth-50 ) rl = rl - 50
          if ( rt > window.innerHeight-50 ) rt = rt - 50
          el_note.style.left = rl + "px"
          el_note.style.top = rt + "px"

          prevX = e.clientX;
          prevY = e.clientY;
        }

        function onMiceUp() {
          window.removeEventListener("mousemove", onMiceMove);
          window.removeEventListener("mouseup", onMiceUp);
          let t = parseInt(el_note.style.top)
          let l = parseInt(el_note.style.left)
          // console.log('Zametka new pos:', l, t)

          if ( !l && !t )
            return
          vue_obj.$store.dispatch('act_saveZomedkoPosition', {top: t, left: l})
        }
      }
    },
    setResizing(){
      let vue_obj = this
      let el_note = document.getElementById('note')
      let el_resizer = el_note.getElementsByClassName('resizer')[0]
      el_resizer.addEventListener('mousedown', onMiceDownRr)
      function onMiceDownRr(e) {

        let prevX = e.clientX;
        let prevY = e.clientY;

        window.addEventListener("mousemove", mousemove);
        window.addEventListener("mouseup", mouseup);

        function mousemove(e) {
          const rect = el_note.getBoundingClientRect();

          el_note.style.width = rect.width - (prevX - e.clientX) + "px";
          el_note.style.height = rect.height - (prevY - e.clientY) + "px";

          prevX = e.clientX;
          prevY = e.clientY;
        }

        function mouseup() {
          window.removeEventListener("mousemove", mousemove);
          window.removeEventListener("mouseup", mouseup);
          let w = parseInt(el_note.style.width)
          let h = parseInt(el_note.style.height)
          if (!w && !h )
            return
          vue_obj.$store.dispatch('saveZomedkoSize', {width: w, height: h})
        }
      }
    },


  },

}
</script>

<style scoped>
  .note{
    /*min-width: 200px;*/
    /*min-height: 100px;*/
    /*border: darkred 1px solid;*/
    position: fixed;
    overflow: hidden;
    z-index: 200;
    background-color: #FFECB3;
    font-family: Roboto, serif;
    font-size: small;
    -webkit-box-shadow: 0 3px 7px -1px rgba(0,0,0,0.75);
    -moz-box-shadow: 0 3px 7px -1px rgba(0,0,0,0.75);
    box-shadow: 0 3px 7px -1px rgba(0,0,0,0.75);
  }
  .note_bar{
    cursor: move;
    height: 25px;
    border-bottom: 1px grey solid;
    display: flex;
    justify-content: space-between;
    user-select: none;
  }
  .nbtn{
    margin: 2px;
    cursor: pointer;
    border: 1px solid darkgray;
    padding: 0 4px;
  }
  .nbtn:hover{
    background-color: black;
    color: white;
    transition: .3s;
  }
  .note_text{
    padding: 3px 10px 5px 10px;
    /*border: 1px green solid;*/
    /*user-select: none;*/
  }
  .resizer{
    position: absolute;
    width: 15px;
    height: 15px;
    /*border: 1px red solid;*/
    /*border-radius: 5px;*/
    /*background-color: black;*/
    z-index: 2;
    bottom: 0;
    right: 0;
    cursor: se-resize;
  }

</style>