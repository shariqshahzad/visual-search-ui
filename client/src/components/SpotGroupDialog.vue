-<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" color="primary" class="my-2 mx-2">
        Show Groups
      </v-btn>
    </template>
    <v-card>
      <v-form ref="form" @submit.prevent="onSubmit($event)">
        <v-card-title>
          <span class="text-h5">Configure Groups</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" class="text-center">
                <v-btn
                  v-if="status === GROUP_STATUSES.SIMILAR"
                  @click="onClickUngroup"
                  >Ungroup</v-btn
                >
                <v-btn
                  v-if="status === GROUP_STATUSES.SIMILAR_PARENT"
                  @click="onClickUngroupAll"
                  >Ungroup All</v-btn
                >
                <v-select
                  v-model="selectedGroupSpot"
                  v-if="status === GROUP_STATUSES.NOT_SIMILAR"
                  required
                  label="Spots"
                  :items="items"
                  return-object
                >
                  <template v-slot:selection="{ item: selectedItem }">
                    <span
                      v-bind:style="{ background: selectedItem.bgColor }"
                      class="dot"
                    >
                      <span
                        :class="`dot-number ${
                          selectedItem.sno > 9 ? 'dot-number-dbl-digit' : ''
                        }`"
                        style="bottom: 0"
                        >{{ selectedItem.sno }}</span
                      >
                    </span>
                  </template>
                  <template v-slot:item="{ item }">
                    <span
                      v-bind:style="{ background: item.bgColor }"
                      class="dot"
                    >
                      <span
                        :class="`dot-number ${
                          item.sno > 9 ? 'dot-number-dbl-digit' : ''
                        }`"
                        >{{ item.sno }}</span
                      >
                    </span>
                  </template>
                </v-select>
              </v-col>
              <!-- <v-col cols="12">
                <v-chip color="red" pill>1</v-chip>
              </v-col> -->
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="onClickClose"> Close </v-btn>
          <v-btn
            v-if="status === GROUP_STATUSES.NOT_SIMILAR"
            color="primary"
            type="submit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<style  scoped>
.dot {
  width: 26px;
  height: 26px;
  border: #fff 3px solid;
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
}

.dot-number {
  position: relative;
  font-size: 0.9rem;
  left: 28%;
  color: #fff;
  bottom: 13%;
}
.dot-number-dbl-digit {
  left: 10%;
  bottom: 13%;
}
</style>
<script>
import { mapGetters, mapMutations } from "vuex";
import { EventBus } from "../event-bus/event-bus";
import { cloneDeep, uniqBy, orderBy } from "lodash";
import { GROUP_STATUSES, singleColors } from "../constants/constants";
import { setSNoAndBgColorToBoundaries } from "../utils/utils";
export default {
  computed: {
    ...mapGetters([
      "searchResultsWithoutSimilarFilter",
      "objectBoundaries",
      "categorizedSearchResults",
    ]),
    isSelectedSpotParent() {},
  },
  mounted() {
    this.items = orderBy(
      uniqBy(this.objectBoundaries, "sno"),
      ["sno"],
      ["asc"]
    ).filter((ob) => ob.id !== this.selectedSpot.id);
  },
  data: () => ({
    GROUP_STATUSES: GROUP_STATUSES,
    dialog: false,
    selectedGroupSpot: null,
    status: "",
    groupData: {},
    items: [],
  }),
  watch: {
    objectBoundaries(newValue, oldValue) {
      this.items = orderBy(uniqBy(newValue, "sno"), ["sno"], ["asc"]).filter(
        (ob) => ob.id !== this.selectedSpot.id
      );
    },
    dialog(newValue, oldValue) {
      if (newValue) {
        const result = this.objectBoundaries.find(
          (bd) => this.selectedSpot.id === bd.id
        );
        if (result && result.hasSimilarity) {
          if (result.id === result.mappedPrId) {
            this.status = GROUP_STATUSES.SIMILAR_PARENT;
            return;
          }
          this.status = GROUP_STATUSES.SIMILAR;
          return;
        }
        this.status = GROUP_STATUSES.NOT_SIMILAR;
        return;
      }
    },
  },
  props: {
    selectedSpot: Object,
  },
  methods: {
    ...mapMutations(["setCategorizedSearchResults", "setObjectBoundaries"]),
    onClickUngroup() {
      this.ungroupItem(this.selectedSpot.id);
      EventBus.$emit("unGrouped", {
        selectedSpot: this.selectedSpot,
      });
      this.dialog = false;
    },
    onClickUngroupAll() {
      const itemsToBeUngrouped = this.objectBoundaries.filter(
        (bd) =>
          bd.mappedPrId === this.selectedSpot.id &&
          bd.id !== this.selectedSpot.id
      );
      if (itemsToBeUngrouped && itemsToBeUngrouped.length > 0)
        itemsToBeUngrouped.forEach((item) => this.ungroupItem(item.id));
      this.setObjectBoundaries(
        this.objectBoundaries.map((bd) => {
          if (bd.id === this.selectedSpot.id) {
            bd.hasSimilarity = false;
          }
          return bd;
        })
      );
      EventBus.$emit("unGrouped", {
        selectedSpot: this.selectedSpot,
      });
      this.dialog = false;
    },
    ungroupItem(id) {
      const objectBoundariesLength = this.objectBoundaries.filter(
        (bd) => !bd.hasSimilarity
      ).length;
      let mappedPrId;
      const objBoundaries = this.objectBoundaries.map((bd) => {
        if (bd.id === id) {
          bd.bgColor = singleColors[objectBoundariesLength];
          bd.sno = _.maxBy(this.objectBoundaries, "sno").sno + 1;
          bd.hasSimilarity = false;
          mappedPrId = bd.mappedPrId;
          bd.mappedPrId = id;
        }
        return bd;
      });
      let hasSimilarities =
        objBoundaries.filter((obd) => obd.mappedPrId === mappedPrId).length > 1;
      if (!hasSimilarities) {
        objBoundaries.map((bd) => {
          if (bd.id === mappedPrId) {
            bd.hasSimilarity = false;
          }
          return bd;
        });
      }

      this.setObjectBoundaries(objBoundaries);
      const csr = this.searchResultsWithoutSimilarFilter.find(
        (sr) => sr.categoryId === id
      );
      this.categorizedSearchResults.push(csr);
      this.setCategorizedSearchResults(this.categorizedSearchResults);
    },
    onSubmit(e) {
      if (!this.$refs.form.validate()) {
        this.dialog = false;
        return;
      }
      const newObjectBoundaries = this.objectBoundaries.map((obd) => {
        if (this.selectedSpot.id === obd.id) {
          obd.mappedPrId = this.selectedGroupSpot.mappedPrId;
          obd.bgColor = this.selectedGroupSpot.bgColor;
          obd.sno = this.selectedGroupSpot.sno;
          obd.hasSimilarity = true;
        }
        if (this.selectedGroupSpot.id === obd.id) obd.hasSimilarity = true;
        return obd;
      });
      this.setObjectBoundaries(newObjectBoundaries);
      this.setCategorizedSearchResults(
        this.categorizedSearchResults.filter(
          (csr) => csr.categoryId !== this.selectedSpot.id
        )
      );
      EventBus.$emit("grouped", {
        selectedSpot: this.selectedSpot,
        selectedGroupSpot: this.selectedGroupSpot,
      });
      this.dialog = false;
      //   const spot = this.categorizedSearchResults.find(csr=>csr.categoryId === this.selectedGroupSpot.id);
      //   this.categorizedSearchResults.map((csr) => {
      //       if(csr.categoryId === this.selectedSpot.id){
      //           csr.
      //       }
      //   });
    },
    onClickClose() {
      this.resetDataAndCloseDialog();
    },
    resetDataAndCloseDialog() {
      this.dialog = false;
      this.groupData = {};
    },
  },
};
</script>