sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/BusyDialog",
	"sap/m/MessageBox",
	"sap/m/Dialog"
], function (Controller, BusyDialog, MessageBox, Dialog) {
	"use strict";

	return Controller.extend("ZPlannerFMB.ZPlannerFMB.controller.View1", {
		onInit: function () {
			this.oUser = sap.ushell.Container.getUser().getId();
			var oUserName = sap.ushell.Container.getUser().getFullName();
			this.getView().byId("idUserName").setText("Welcome " + oUserName + " ( " + this.oUser + " ) ");
			// var contractID = this.getView().byId("contractNo").getValue();
			var displayApprovedPlanData = new sap.ui.model.json.JSONModel();
			this.getView().setModel(displayApprovedPlanData, "displayApprovedPlanData");

			var masterDataModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(masterDataModel, "masterDataModel");

			var displayPlanData = new sap.ui.model.json.JSONModel();
			this.getView().setModel(displayPlanData, "displayPlanData");

			var masterDataModelRoles = new sap.ui.model.json.JSONModel();
			this.getView().setModel(masterDataModel, "masterDataModelRoles");

		},

		onpressDisplay: function () {
			debugger;
			var that = this;
			var contractID = this.getView().byId("contractNo").getValue();
			if (contractID === "") {
				MessageBox.error("Please enter Contract number");

			} else {
				this.getView().byId("FTEform").setVisible(true);
				this.getView().byId("footnote").setVisible(true);
				that.getView().byId("footnote2").setVisible(true);

				var displayApprovedPlanData = new sap.ui.model.json.JSONModel();
				this.getView().setModel(displayApprovedPlanData, "displayApprovedPlanData");

				var masterDataModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(masterDataModel, "masterDataModel");

				var displayPlanData = new sap.ui.model.json.JSONModel();
				this.getView().setModel(displayPlanData, "displayPlanData");

				var url =
					"/sap/opu/odata/sap/ZODATA_FICO_FMB_PLANNER_DU_DIS_SRV/headerSet?$filter=(ImVbeln eq ' " + contractID +
					"' and ImUserId eq '" + that.oUser +
					"')&$expand=ITMASTERDATASet,ITFMBAPPROVERSet&$format=json";
				sap.ui.core.BusyIndicator.show();
				$.ajax({
					type: "GET",
					contentType: 'application/json',
					dataType: 'json',
					async: true,
					crossDomain: true,
					url: url,
					headers: {
						"Content-Type": "application/atom+xml;type=entry; charset=utf-8",
						"X-CSRF-TOKEN": "Fetch",
						"Access-Control-Allow-Origin": url
					},
					success: function (json, status, request) {

						var results = json.d.results[0];
						var DisplayData = results.ITFMBAPPROVERSet.results[0];
						var EXerror = results.ExError
							//	var pendinginfo = "FMB Project(s) pending to be released. Please coordinate with DM/PM."

						if (EXerror !== "") {
							var errormsg = (EXerror).split(":").join("\n Project ID: \n").split(",").join("\n");
							MessageBox.information(errormsg);
						}

						// added
						var ApprovedPlanData = results.ITFMBAPPROVERSet.results;
						that.getView().getModel("displayPlanData").setData(ApprovedPlanData);
						that.getView().getModel("displayApprovedPlanData").setData(DisplayData);
						// var masterData = results.ITMASTERDATASet.results;

						// that.getView().getModel("masterDataModel").setData(masterData);

						// that.getView().getModel("displayApprovedPlanData").setData(DisplayData);
						var totalPlannerData = results.ITMASTERDATASet.results;
						var roles = {
							Admin: [],
							DUManager: [],
							DUHead: [],
							KDM: []
						}

						for (var i = 0; i < totalPlannerData.length; i++) {
							if (totalPlannerData[i].Category == "ADMIN") {
								roles.Admin.push(totalPlannerData[i]);
							} else if (totalPlannerData[i].Category == "DU MANAGER") {
								roles.DUManager.push(totalPlannerData[i]);

							} else if (totalPlannerData[i].Category == "DU HEAD") {
								roles.DUHead.push(totalPlannerData[i]);

							} else if (totalPlannerData[i].Category == "KDM") {
								roles.KDM.push(totalPlannerData[i]);
							}
						}
						that.getView().getModel("masterDataModelRoles").setData(roles);
						// that.getView().byId("idMsgStrip").setVisible(false);

						if (results.ExText != "EDIT") {

							if (results.ITFMBAPPROVERSet.results.length >= 0) {

								var masterData = results.ITMASTERDATASet.results;
								if (masterData.length > 0) {
									that.getView().getModel("masterDataModel").setData(masterData);
									var MasterPlanData = that.getView().getModel("masterDataModel").getData();
									var ApprovalModel = that.getView().getModel("displayPlanData").getData();
									var KdmName, KdmEmail, KdmId;
									if (ApprovalModel.length > 0) {
										for (var i = 0; i < ApprovalModel.length; i++) {
											KdmName = ApprovalModel[i].KdmName;
											KdmEmail = ApprovalModel[i].KdmEmail;
											KdmId = ApprovalModel[i].KdmId;
											that.getView().byId("kdmInput").setValue(KdmName);

											if (KdmEmail == "" || KdmName == "" || KdmId == "") {
												for (var i = 0; i < MasterPlanData.length; i++) {
													if (MasterPlanData[i].Category == "KDM") {
														KdmName = MasterPlanData[i].Name;
														KdmEmail = MasterPlanData[i].EmailId;
														KdmId = MasterPlanData[i].Pernr;
														that.getView().byId("kdmInput").setValue(KdmName);
														break;
													}
												}
											}

										}
									}

								}
							}
							var masterData = results.ITMASTERDATASet.results;

							that.getView().getModel("masterDataModel").setData(masterData);
							var MasterPlanData = that.getView().getModel("masterDataModel").getData();
							var KdmName, KdmEmail, KdmId;
							for (var i = 0; i < MasterPlanData.length; i++) {
								if (MasterPlanData[i].Category == "KDM") {
									KdmName = MasterPlanData[i].Name;
									KdmEmail = MasterPlanData[i].EmailId;
									KdmId = MasterPlanData[i].Pernr;

									break;
								}
							}

							if (DisplayData == undefined || DisplayData == "") {
								var DisplayArr = {
									KdmName: ""
								};
								DisplayArr.KdmName = KdmName
								that.getView().getModel("displayApprovedPlanData").setData(DisplayArr)
									//	that.getView().byId("kdmInput").setValue(KdmName);

							}

							that.getView().byId("select1").setEditable(false);
							that.getView().byId("select2").setEditable(false);
							// that.getView().byId("select3").setEditable(false);
							that.getView().byId("savebutton").setVisible(false);

						}
						//	if(results.ExText = "EDIT") 
						else {
							// that.onedit();
							if ((results.ExError == "" && results.ExBaseCheck == "N") || (results.ExBaseCheck == "Y")) {
								// that.getView().byId("idMsgStrip").setVisible(true);
								that.getView().byId("select1").setEditable(true);
								that.getView().byId("select2").setEditable(true);
								// that.getView().byId("select3").setEditable(true);
								that.getView().byId("savebutton").setVisible(true);

								var DisplayData = results.ITFMBAPPROVERSet.results[0];

								var ApprovedPlanData = results.ITFMBAPPROVERSet.results;
								that.getView().getModel("displayPlanData").setData(ApprovedPlanData);
								var ApprovalModel = that.getView().getModel("displayPlanData").getData();
								that.getView().getModel("displayApprovedPlanData").setData(DisplayData);
								var masterData = results.ITMASTERDATASet.results;

								that.getView().getModel("masterDataModel").setData(masterData);
								var MasterPlanData = that.getView().getModel("masterDataModel").getData();
								var KdmName, KdmEmail, KdmId;
								for (var i = 0; i < MasterPlanData.length; i++) {
									if (MasterPlanData[i].Category == "KDM") {
										KdmName = MasterPlanData[i].Name;
										KdmEmail = MasterPlanData[i].EmailId;
										KdmId = MasterPlanData[i].Pernr;

										break;
									}
								}
								// }

								if (DisplayData == undefined || DisplayData == "") {
									var DisplayArr = {
										KdmName: ""
									};
									DisplayArr.KdmName = KdmName
									that.getView().getModel("displayApprovedPlanData").setData(DisplayArr)
										//	that.getView().byId("kdmInput").setValue(KdmName);

								} else if (DisplayData.KdmId != KdmId) {
									// MessageBox.information("The KDM value has been changed.");
									// MessageBox.information("The KDM value will be updated.", {
									// 	actions: [MessageBox.Action.OK],
									// 	emphasizedAction: MessageBox.Action.OK,
									// 	onClose: function (sAction) {

									// 		that.onclickok();
									// 		// that.onsave();
									// 	}
									// });
									that.onclickok();
									that.getView().byId("kdmInput").setValue(KdmName);
								} else {
									that.getView().byId("kdmInput").setValue(KdmName);
								}
								// 	else if (ApprovalModel.length == 0) {
								// 	that.getView().byId("kdmInput").setValue(KdmName);
								// } else if (ApprovalModel.length > 0) {
								// 	if (DisplayData.KdmId != KdmId) {
								// 		that.getView().byId("kdmInput").setValue(KdmName);displayApprovedPlanData
								// 	} else {
								// 		that.getView().byId("kdmInput").setValue(KdmName);
								// 	}

								// }
							}

						}

						sap.ui.core.BusyIndicator.hide();

					},
					error: function (e) {
						sap.ui.core.BusyIndicator.hide();
					}
				});
			}
		},

		changePlanner1: function (evt) {
			var that = this;
			var FMBFTEplannerKey = evt.getSource().getSelectedKey();
			if (FMBFTEplannerKey == "") {
				that.getView().byId("select1").setSelectedKey("");
				that.getView().byId("select1").setValue("");
				MessageBox.error("Please select FMB FTE Planner from drop down only.");
			}
		},

		changeDUManager: function (evt) {
			var that = this;
			var DUManagerKey = evt.getSource().getSelectedKey();
			if (DUManagerKey == "") {
				that.getView().byId("select2").setSelectedKey("");
				that.getView().byId("select2").setValue("");
				MessageBox.error("Please select Delivery Manager from drop down only.");
			}

		},

		onsavepress: function () {
			debugger;
			var that = this;

			// keys for all drop downs
			var plannerKey = that.getView().byId("select1").getSelectedKey();
			var DumanagerKey = that.getView().byId("select2").getSelectedKey();
			// var DuHeadKey = that.getView().byId("select3").getSelectedKey();
			// var KDMKey = that.getView().byId("kdmInput").getSelectedKey();

			if (plannerKey == "") {
				that.getView().byId("select1").setSelectedKey("");
				that.getView().byId("select1").setValue("");
				MessageBox.error("Please select FMB FTE Planner from drop down only.");
			} else if (DumanagerKey == "") {
				that.getView().byId("select2").setSelectedKey("");
				that.getView().byId("select2").setValue("");
				MessageBox.error("Please select Delivery Manager from drop down only.");
			} else {
				// values for all drop downs
				var planner = that.getView().byId("select1").getValue();
				var Dumanager = that.getView().byId("select2").getValue();
				// var DuHead = that.getView().byId("select3").getValue();
				var KDM = that.getView().byId("kdmInput").getValue();
				if (planner == "" || Dumanager == "" || KDM == "") {
					MessageBox.error("Please update all the required fields.");

				} else {
					that.onsave();
				}
			}
		},

		onclickok: function () {
			var that = this;
			var MasterPlanData = that.getView().getModel("masterDataModelRoles").getData();

			var PlannerId = that.getView().byId("select1").getSelectedKey()
			var PlannerName, PlannerEmail;
			for (var i = 0; i < MasterPlanData.Admin.length; i++) {
				if (MasterPlanData.Admin[i].Pernr == PlannerId) {
					PlannerName = MasterPlanData.Admin[i].Name;
					PlannerEmail = MasterPlanData.Admin[i].EmailId
					break;
				}
			}

			var DumanagerId = that.getView().byId("select2").getSelectedKey()
			var DumanagerName, DumanagerEmail;
			for (var i = 0; i < MasterPlanData.DUManager.length; i++) {
				if (MasterPlanData.DUManager[i].Pernr == DumanagerId) {
					DumanagerName = MasterPlanData.DUManager[i].Name;
					DumanagerEmail = MasterPlanData.DUManager[i].EmailId
					break;
				}
			}

			// var DuheadId = that.getView().byId("select3").getSelectedKey()
			// var DuheadName, DuheadEmail;
			// for (var i = 0; i < MasterPlanData.DUHead.length; i++) {
			// 	if (MasterPlanData.DUHead[i].Pernr == DuheadId) {
			// 		DuheadName = MasterPlanData.DUHead[i].Name;
			// 		DuheadEmail = MasterPlanData.DUHead[i].EmailId
			// 		break;
			// 	}
			// }

			var KdmName = that.getView().byId("kdmInput").getValue()
			var KdmId, KdmEmail;
			for (var i = 0; i < MasterPlanData.KDM.length; i++) {
				if (MasterPlanData.KDM[i].Name == KdmName) {
					KdmId = MasterPlanData.KDM[i].Pernr;
					KdmEmail = MasterPlanData.KDM[i].EmailId
					break;
				}
			}
			var newData1 = {
				"ImVbeln": that.getView().byId("contractNo").getValue(),
				"ExText": "EDIT",
				"ITEMSet": [],
			};
			var locobj1 = {
				"Mandt": "",
				"Contract": that.getView().byId("contractNo").getValue(),
				"PlannerId": PlannerId,
				"PlannerName": PlannerName,
				"PlannerEmail": PlannerEmail,
				"DumanagerId": DumanagerId,
				"DumanagerName": DumanagerName,
				"DumanagerEmail": DumanagerEmail,
				// "DuheadId": DuheadId,
				// "DuheadName": DuheadName,
				// "DuheadEmail": DuheadEmail,
				// "DuheadId": "",
				// "DuheadName": "",
				// "DuheadEmail": "",
				"KdmId": KdmId,
				"KdmName": KdmName,
				"KdmEmail": KdmEmail
			};

			newData1.ITEMSet.push(locobj1);

			var that = this;
			var url = "/sap/opu/odata/sap/ZODATA_FICO_FMB_PLANNER_DU_SAV_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(url, true);
			oModel.setUseBatch(false);
			oModel.create("/HEADERSet", newData1, {
				method: "POST",
				success: function (data) {

					// 	sap.m.MessageBox.success('', {
					// 		actions: ["OK", MessageBox.Action.CLOSE],
					// 		emphasizedAction: "OK",
					// 		onClose: function () {
					// 			that.onInit();
					// 			that.getView().byId("FTEform").setVisible(false);
					// 			that.getView().byId("contractNo").setValue("");
					// 			that.getView().byId("savebutton").setVisible(false);
					// 			that.getView().byId("footnote").setVisible(false);
					// 		 }
					// 	});
				},

				error: function (data) {
					sap.m.MessageBox.error("Update failed");
				}
			});

		},

		onsave: function (oEvent) {
			var that = this;
			var contractID = that.getView().byId("contractNo").getValue();
			var MasterPlanData = that.getView().getModel("masterDataModelRoles").getData();

			var PlannerId = that.getView().byId("select1").getSelectedKey()
			var PlannerName, PlannerEmail;
			for (var i = 0; i < MasterPlanData.Admin.length; i++) {
				if (MasterPlanData.Admin[i].Pernr == PlannerId) {
					PlannerName = MasterPlanData.Admin[i].Name;
					PlannerEmail = MasterPlanData.Admin[i].EmailId
					break;
				}
			}

			var DumanagerId = that.getView().byId("select2").getSelectedKey()
			var DumanagerName, DumanagerEmail;
			for (var i = 0; i < MasterPlanData.DUManager.length; i++) {
				if (MasterPlanData.DUManager[i].Pernr == DumanagerId) {
					DumanagerName = MasterPlanData.DUManager[i].Name;
					DumanagerEmail = MasterPlanData.DUManager[i].EmailId
					break;
				}
			}

			// var DuheadId = that.getView().byId("select3").getSelectedKey()
			// var DuheadName, DuheadEmail;
			// for (var i = 0; i < MasterPlanData.DUHead.length; i++) {
			// 	if (MasterPlanData.DUHead[i].Pernr == DuheadId) {
			// 		DuheadName = MasterPlanData.DUHead[i].Name;
			// 		DuheadEmail = MasterPlanData.DUHead[i].EmailId
			// 		break;
			// 	}
			// }

			var KdmName = that.getView().byId("kdmInput").getValue()
			var KdmId, KdmEmail;
			for (var i = 0; i < MasterPlanData.KDM.length; i++) {
				if (MasterPlanData.KDM[i].Name == KdmName) {
					KdmId = MasterPlanData.KDM[i].Pernr;
					KdmEmail = MasterPlanData.KDM[i].EmailId
					break;
				}
			}

			// 	var KDMId = that.getView().byId("kdmInput").getSelectedKey()
			// var KDMName, KDMEmail;
			// for (var i = 0; i < MasterPlanData.KDM.length; i++) {
			// 	if (MasterPlanData.KDM[i].Pernr == KDMId) {
			// 		KDMName = MasterPlanData.KDM[i].Name;
			// 		KDMEmail = MasterPlanData.KDM[i].EmailId
			// 		break;
			// 	}
			// }

			var newData1 = {
				"ImVbeln": that.getView().byId("contractNo").getValue(),
				"ExText": "EDIT",
				"ITEMSet": [],
			};
			var locobj1 = {
				"Mandt": "",
				"Contract": that.getView().byId("contractNo").getValue(),
				"PlannerId": PlannerId,
				"PlannerName": PlannerName,
				"PlannerEmail": PlannerEmail,
				"DumanagerId": DumanagerId,
				"DumanagerName": DumanagerName,
				"DumanagerEmail": DumanagerEmail,
				// "DuheadId": DuheadId,
				// "DuheadName": DuheadName,
				// "DuheadEmail": DuheadEmail,
				"DuheadId": "",
				"DuheadName": "",
				"DuheadEmail": "",
				"KdmId": KdmId,
				"KdmName": KdmName,
				"KdmEmail": KdmEmail
			};

			newData1.ITEMSet.push(locobj1);

			var that = this;
			var url = "/sap/opu/odata/sap/ZODATA_FICO_FMB_PLANNER_DU_SAV_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(url, true);
			oModel.setUseBatch(false);
			oModel.create("/HEADERSet", newData1, {
				method: "POST",
				success: function (data) {

					sap.m.MessageBox.success('Data saved successfully.', {
						actions: ["OK", MessageBox.Action.CLOSE],
						emphasizedAction: "OK",
						onClose: function () {
							that.onInit();
							that.getView().byId("FTEform").setVisible(false);
							that.getView().byId("contractNo").setValue("");
							that.getView().byId("savebutton").setVisible(false);
							that.getView().byId("footnote").setVisible(false);
							that.getView().byId("footnote2").setVisible(false);
						}

					});

					var url1 = "/sap/opu/odata/sap/ZODATA_FICO_FMB_FTEPLANNER_EMA_SRV/FMBEmailSet(ImVbeln='" +
						contractID + "',ImPernr='" + that.oUser + "')?$format=json";
					sap.ui.core.BusyIndicator.show();
					$.ajax({
						type: "GET",
						contentType: 'application/json',
						dataType: 'json',
						async: true,
						crossDomain: true,
						url: url1,
						headers: {
							"Content-Type": "application/atom+xml;type=entry; charset=utf-8",
							"X-CSRF-TOKEN": "Fetch",
							"Access-Control-Allow-Origin": url1
						},
						success: function (json, status, request) {
							console.log("Email sent");
							sap.ui.core.BusyIndicator.hide();

						},
						error: function (e) {
							sap.ui.core.BusyIndicator.hide();
							// sap.m.MessageBox.error("Update failed");
						}
					});
				},

				error: function (data) {
					sap.m.MessageBox.error("Update failed");
				}
			});
		}

	});
});