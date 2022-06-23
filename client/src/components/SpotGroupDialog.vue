-<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" color="primary" class="my-2 mx-2">
        Show Groups
      </v-btn>
    </template>
    <v-card>
      <v-form ref="form" @submit.prevent="onSubmit">
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
                  v-if="status === GROUP_STATUSES.NOT_SIMILAR"
                  disabled
                  :items="items"
                  label="Selected Group"
                  solo
                ></v-select>
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

<script>
import { mapGetters, mapMutations } from "vuex";
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
  data: () => ({
    GROUP_STATUSES: GROUP_STATUSES,
    dialog: false,
    status: "",
    groupData: {},
    items: ["spot 1", "spot 2", "spot 3", "spot 4"],
  }),
  watch: {
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
    },
    ungroupItem(id) {
      const objectBoundariesLength = this.objectBoundaries.filter(
        (bd) => !bd.hasSimilarity
      ).length;
      this.setObjectBoundaries(
        this.objectBoundaries.map((bd) => {
          if (bd.id === id) {
            bd.bgColor = singleColors[objectBoundariesLength];
            bd.sno = _.maxBy(this.objectBoundaries, "sno").sno + 1;
            bd.hasSimilarity = false;
            bd.mappedPrId = id;
          }
          return bd;
        })
      );
      const csr = this.searchResultsWithoutSimilarFilter.find(
        (sr) => sr.categoryId === id
      );
      this.categorizedSearchResults.push(csr);
      this.setCategorizedSearchResults(this.categorizedSearchResults);
    },
    onSubmit(e) {
      if (!this.$refs.form.validate()) {
        return;
      }
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