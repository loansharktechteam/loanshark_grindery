import React, { createContext, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import NexusClient from "grindery-nexus-client";
import { isLocalOrStaging } from "../constants";
import { defaultFunc } from "../helpers/utils";
import useAppContext from "../hooks/useAppContext";
import useWorkflowContext from "../hooks/useWorkflowContext";
import { Action, Connector, Field, Trigger } from "../types/Connector";

type WorkflowStepContextProps = {
  type: "trigger" | "action";
  index: number;
  step: number;
  activeRow: number;
  username: string;
  connector: null | Connector;
  operation: Trigger | Action | undefined | null;
  operationIsConfigured: boolean;
  operationIsAuthenticated: boolean;
  operationAuthenticationIsRequired: boolean;
  inputError: string;
  errors: any;
  operationIsTested: boolean | string;
  savedCredentials: any[];
  setConnector: (connector: Connector | null) => void;
  setActiveRow: (row: number) => void;
  setUsername: (name: string) => void;
  getConnector: (key: string) => void;
  setInputError: (a: string) => void;
  setErrors: (a: any) => void;
  setOperationIsTested: (a: boolean | string) => void;
  setSavedCredentials: React.Dispatch<React.SetStateAction<any[]>>;
};

type WorkflowStepContextProviderProps = {
  children: React.ReactNode;
  type: "trigger" | "action";
  index: number;
  step: number;
  setOutputFields: React.Dispatch<React.SetStateAction<any[]>>;
};

export const WorkflowStepContext = createContext<WorkflowStepContextProps>({
  type: "trigger",
  index: 0,
  step: 1,
  activeRow: 0,
  username: "",
  connector: null,
  operation: undefined,
  operationIsConfigured: false,
  operationIsAuthenticated: false,
  operationAuthenticationIsRequired: false,
  inputError: "",
  errors: false,
  operationIsTested: false,
  savedCredentials: [],
  setConnector: defaultFunc,
  setActiveRow: defaultFunc,
  setUsername: defaultFunc,
  getConnector: defaultFunc,
  setInputError: defaultFunc,
  setErrors: defaultFunc,
  setOperationIsTested: defaultFunc,
  setSavedCredentials: defaultFunc,
});

export const WorkflowStepContextProvider = ({
  children,
  type,
  index,
  step,
  setOutputFields,
}: WorkflowStepContextProviderProps) => {
  let { key } = useParams();
  const { client, access_token } = useAppContext();
  const { workflow, updateWorkflow } = useWorkflowContext();
  const [activeRow, setActiveRow] = useState(0);
  const [username, setUsername] = useState("");
  const [connector, setConnector] = useState<null | Connector>(null);
  const [inputError, setInputError] = useState("");
  const [errors, setErrors] = useState<any>(false);
  const [operation, setOperation] = useState<
    null | undefined | Trigger | Action
  >(null);
  const [operationIsTested, setOperationIsTested] = useState<boolean | string>(
    key ? "skipped" : false
  );
  const [savedCredentials, setSavedCredentials] = useState<any[]>([]);

  const nexus = new NexusClient();
  nexus.authenticate(access_token || "");

  const workflowInput =
    type === "trigger" ? workflow.trigger.input : workflow.actions[index].input;

  const requiredFields = [
    ...((operation &&
      operation.operation &&
      operation.operation.inputFields &&
      operation.operation.inputFields
        .filter((field: Field) => field && field.required)
        .map((field: Field) => field.key)) ||
      []),
    ...((operation &&
      operation.inputFields &&
      operation.inputFields
        .filter((field: Field) => field && field.required)
        .map((field: Field) => field.key)) ||
      []),
  ];

  const operationIsConfigured = Boolean(
    requiredFields.filter(
      (field: string) =>
        workflowInput &&
        typeof workflowInput[field] !== "undefined" &&
        workflowInput[field] !== "" &&
        workflowInput[field] !== null
    ).length === requiredFields.length &&
    (operation &&
      operation.operation &&
      operation.operation.type === "blockchain:event"
      ? workflowInput._grinderyChain && workflowInput._grinderyContractAddress
      : true) &&
    !inputError &&
    typeof errors === "boolean"
  );

  const operationIsAuthenticated = Boolean(
    (connector && !connector.authentication) ||
    (type === "trigger"
      ? workflow.trigger?.authentication && connector?.authentication
      : workflow.actions[index]?.authentication && connector?.authentication)
  );

  const operationAuthenticationIsRequired = Boolean(
    connector && connector.authentication
  );

  const passOutputFields = useCallback(() => {
    setOutputFields((outputFields: any[]) => {
      const workflowOutput = [...outputFields];
      workflowOutput[step - 1] = {
        connector,
        operation: {
          ...operation?.operation,
          type: type,
        },
        step: step,
        index: step - 2,
      };
      return workflowOutput;
    });
  }, [operation]);

  const getConnectoAction = (actionName: string) => {
    let action
    if (actionName === 'erc1155') {
      action = {
        "key": "erc1155",
        "name": "ERC1155",
        "version": "1.0.0",
        "platformVersion": "1.0.0",
        "type": "web3",
        "triggers": [
          {
            "key": "ApprovalForAllTrigger",
            "name": "Approval For All",
            "display": {
              "label": "Approval For All",
              "description": "Approval For All"
            },
            "operation": {
              "type": "blockchain:event",
              "signature": "event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved)",
              "inputFields": [
                {
                  "key": "_owner",
                  "label": "Owner",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_operator",
                  "label": "Operator",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_approved",
                  "label": "Approved",
                  "type": "boolean",
                  "placeholder": "",
                  "list": false
                }
              ],
              "outputFields": [
                {
                  "key": "_owner",
                  "label": "Owner",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_operator",
                  "label": "Operator",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_approved",
                  "label": "Approved",
                  "type": "boolean",
                  "placeholder": "",
                  "list": false
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "CreateERC1155_v1Trigger",
            "name": "Create ERC 1155 v 1",
            "display": {
              "label": "Create ERC 1155 v 1",
              "description": "Create ERC 1155 v 1"
            },
            "operation": {
              "type": "blockchain:event",
              "signature": "event CreateERC1155_v1(address indexed creator, string name, string symbol)",
              "inputFields": [
                {
                  "key": "creator",
                  "label": "Creator",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "name",
                  "label": "Name",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                },
                {
                  "key": "symbol",
                  "label": "Symbol",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                }
              ],
              "outputFields": [
                {
                  "key": "creator",
                  "label": "Creator",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "name",
                  "label": "Name",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                },
                {
                  "key": "symbol",
                  "label": "Symbol",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "OwnershipTransferredTrigger",
            "name": "Ownership Transferred",
            "display": {
              "label": "Ownership Transferred",
              "description": "Ownership Transferred"
            },
            "operation": {
              "type": "blockchain:event",
              "signature": "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
              "inputFields": [
                {
                  "key": "previousOwner",
                  "label": "Previous Owner",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "newOwner",
                  "label": "New Owner",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                }
              ],
              "outputFields": [
                {
                  "key": "previousOwner",
                  "label": "Previous Owner",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "newOwner",
                  "label": "New Owner",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "SecondarySaleFeesTrigger",
            "name": "Secondary Sale Fees",
            "display": {
              "label": "Secondary Sale Fees",
              "description": "Secondary Sale Fees"
            },
            "operation": {
              "type": "blockchain:event",
              "signature": "event SecondarySaleFees(uint256 tokenId, address[] recipients, uint256[] bps)",
              "inputFields": [
                {
                  "key": "tokenId",
                  "label": "Token Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                },
                {
                  "key": "recipients",
                  "label": "Recipients",
                  "type": "address",
                  "placeholder": "",
                  "list": true
                },
                {
                  "key": "bps",
                  "label": "Bps",
                  "type": "string",
                  "placeholder": "",
                  "list": true
                }
              ],
              "outputFields": [
                {
                  "key": "tokenId",
                  "label": "Token Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                },
                {
                  "key": "recipients",
                  "label": "Recipients",
                  "type": "address",
                  "placeholder": "",
                  "list": true
                },
                {
                  "key": "bps",
                  "label": "Bps",
                  "type": "string",
                  "placeholder": "",
                  "list": true
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "SignerAddedTrigger",
            "name": "Signer Added",
            "display": {
              "label": "Signer Added",
              "description": "Signer Added"
            },
            "operation": {
              "type": "blockchain:event",
              "signature": "event SignerAdded(address indexed account)",
              "inputFields": [
                {
                  "key": "account",
                  "label": "Account",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                }
              ],
              "outputFields": [
                {
                  "key": "account",
                  "label": "Account",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "SignerRemovedTrigger",
            "name": "Signer Removed",
            "display": {
              "label": "Signer Removed",
              "description": "Signer Removed"
            },
            "operation": {
              "type": "blockchain:event",
              "signature": "event SignerRemoved(address indexed account)",
              "inputFields": [
                {
                  "key": "account",
                  "label": "Account",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                }
              ],
              "outputFields": [
                {
                  "key": "account",
                  "label": "Account",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "TransferBatchTrigger",
            "name": "Transfer Batch",
            "display": {
              "label": "Transfer Batch",
              "description": "Transfer Batch"
            },
            "operation": {
              "type": "blockchain:event",
              "signature": "event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values)",
              "inputFields": [
                {
                  "key": "_operator",
                  "label": "Operator",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_from",
                  "label": "From",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_to",
                  "label": "To",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_ids",
                  "label": "Ids",
                  "type": "string",
                  "placeholder": "",
                  "list": true
                },
                {
                  "key": "_values",
                  "label": "Values",
                  "type": "string",
                  "placeholder": "",
                  "list": true
                }
              ],
              "outputFields": [
                {
                  "key": "_operator",
                  "label": "Operator",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_from",
                  "label": "From",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_to",
                  "label": "To",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_ids",
                  "label": "Ids",
                  "type": "string",
                  "placeholder": "",
                  "list": true
                },
                {
                  "key": "_values",
                  "label": "Values",
                  "type": "string",
                  "placeholder": "",
                  "list": true
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "TransferSingleTrigger",
            "name": "Transfer Single",
            "display": {
              "label": "Transfer Single",
              "description": "Transfer Single"
            },
            "operation": {
              "type": "blockchain:event",
              "signature": "event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value)",
              "inputFields": [
                {
                  "key": "_operator",
                  "label": "Operator",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_from",
                  "label": "From",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_to",
                  "label": "To",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                },
                {
                  "key": "_value",
                  "label": "Value",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                }
              ],
              "outputFields": [
                {
                  "key": "_operator",
                  "label": "Operator",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_from",
                  "label": "From",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_to",
                  "label": "To",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false
                },
                {
                  "key": "_id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                },
                {
                  "key": "_value",
                  "label": "Value",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "URITrigger",
            "name": "URI",
            "display": {
              "label": "URI",
              "description": "URI"
            },
            "operation": {
              "type": "blockchain:event",
              "signature": "event URI(string _value, uint256 indexed _id)",
              "inputFields": [
                {
                  "key": "_value",
                  "label": "Value",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                },
                {
                  "key": "_id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                }
              ],
              "outputFields": [
                {
                  "key": "_value",
                  "label": "Value",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                },
                {
                  "key": "_id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false
                }
              ],
              "sample": {}
            }
          }
        ],
        "actions": [
          {
            "key": "addSignerAction",
            "name": "Add Signer",
            "display": {
              "label": "Add Signer",
              "description": "Add Signer"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "account",
                  "label": "Account",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "balanceOfAction",
            "name": "Balance Of (View function)",
            "display": {
              "label": "Balance Of (View function)",
              "description": "Balance Of (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function balanceOf(address _owner, uint256 _id) view returns uint256",
              "inputFields": [
                {
                  "key": "_owner",
                  "label": "Owner",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Balance Of",
                  "type": "string"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "balanceOfBatchAction",
            "name": "Balance Of Batch (View function)",
            "display": {
              "label": "Balance Of Batch (View function)",
              "description": "Balance Of Batch (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function balanceOfBatch(address[] _owners, uint256[] _ids) view returns uint256[]",
              "inputFields": [
                {
                  "key": "_owners",
                  "label": "Owners",
                  "type": "address",
                  "placeholder": "",
                  "list": true,
                  "required": true
                },
                {
                  "key": "_ids",
                  "label": "Ids",
                  "type": "string",
                  "placeholder": "",
                  "list": true,
                  "required": true
                }
              ],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Balance Of Batch",
                  "type": "string"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "burnAction",
            "name": "Burn",
            "display": {
              "label": "Burn",
              "description": "Burn"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function burn(address _owner, uint256 _id, uint256 _value)",
              "inputFields": [
                {
                  "key": "_owner",
                  "label": "Owner",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_value",
                  "label": "Value",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "contractURIAction",
            "name": "Contract URI (View function)",
            "display": {
              "label": "Contract URI (View function)",
              "description": "Contract URI (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function contractURI() view returns string",
              "inputFields": [],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Contract URI",
                  "type": "string"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "creatorsAction",
            "name": "Creators (View function)",
            "display": {
              "label": "Creators (View function)",
              "description": "Creators (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function creators(uint256 param0) view returns address",
              "inputFields": [
                {
                  "key": "param0",
                  "label": "Param 0",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Creators",
                  "type": "address"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "feesAction",
            "name": "Fees (View function)",
            "display": {
              "label": "Fees (View function)",
              "description": "Fees (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function fees(uint256 param0, uint256 param1) view returns address, uint256",
              "inputFields": [
                {
                  "key": "param0",
                  "label": "Param 0",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                },
                {
                  "key": "param1",
                  "label": "Param 1",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "getFeeBpsAction",
            "name": "Get Fee Bps (View function)",
            "display": {
              "label": "Get Fee Bps (View function)",
              "description": "Get Fee Bps (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function getFeeBps(uint256 id) view returns uint256[]",
              "inputFields": [
                {
                  "key": "id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Get Fee Bps",
                  "type": "string"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "getFeeRecipientsAction",
            "name": "Get Fee Recipients (View function)",
            "display": {
              "label": "Get Fee Recipients (View function)",
              "description": "Get Fee Recipients (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function getFeeRecipients(uint256 id) view returns address[]",
              "inputFields": [
                {
                  "key": "id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Get Fee Recipients",
                  "type": "address"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "isApprovedForAllAction",
            "name": "Is Approved For All (View function)",
            "display": {
              "label": "Is Approved For All (View function)",
              "description": "Is Approved For All (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function isApprovedForAll(address _owner, address _operator) view returns bool",
              "inputFields": [
                {
                  "key": "_owner",
                  "label": "Owner",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_operator",
                  "label": "Operator",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Is Approved For All",
                  "type": "boolean"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "isOwnerAction",
            "name": "Is Owner (View function)",
            "display": {
              "label": "Is Owner (View function)",
              "description": "Is Owner (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function isOwner() view returns bool",
              "inputFields": [],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Is Owner",
                  "type": "boolean"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "isSignerAction",
            "name": "Is Signer (View function)",
            "display": {
              "label": "Is Signer (View function)",
              "description": "Is Signer (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function isSigner(address account) view returns bool",
              "inputFields": [
                {
                  "key": "account",
                  "label": "Account",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Is Signer",
                  "type": "boolean"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "mintAction",
            "name": "Mint",
            "display": {
              "label": "Mint",
              "description": "Mint"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function mint(uint256 id, uint8 v, bytes32 r, bytes32 s, tuple[] fees, uint256 supply, string uri)",
              "inputFields": [
                {
                  "key": "id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                },
                {
                  "key": "v",
                  "label": "V",
                  "type": "number",
                  "placeholder": "",
                  "list": false,
                  "required": true
                },
                {
                  "key": "r",
                  "label": "R",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                },
                {
                  "key": "s",
                  "label": "S",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                },
                {
                  "key": "fees",
                  "label": "Fees",
                  "type": "string",
                  "placeholder": "",
                  "list": true,
                  "required": true
                },
                {
                  "key": "supply",
                  "label": "Supply",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                },
                {
                  "key": "uri",
                  "label": "Uri",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "nameAction",
            "name": "Name (View function)",
            "display": {
              "label": "Name (View function)",
              "description": "Name (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function name() view returns string",
              "inputFields": [],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Name",
                  "type": "string"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "ownerAction",
            "name": "Owner (View function)",
            "display": {
              "label": "Owner (View function)",
              "description": "Owner (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function owner() view returns address",
              "inputFields": [],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Owner",
                  "type": "address"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "removeSignerAction",
            "name": "Remove Signer",
            "display": {
              "label": "Remove Signer",
              "description": "Remove Signer"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function removeSigner(address account)",
              "inputFields": [
                {
                  "key": "account",
                  "label": "Account",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "renounceOwnershipAction",
            "name": "Renounce Ownership",
            "display": {
              "label": "Renounce Ownership",
              "description": "Renounce Ownership"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function renounceOwnership()",
              "inputFields": [],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "renounceSignerAction",
            "name": "Renounce Signer",
            "display": {
              "label": "Renounce Signer",
              "description": "Renounce Signer"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function renounceSigner()",
              "inputFields": [],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "safeBatchTransferFromAction",
            "name": "Safe Batch Transfer From",
            "display": {
              "label": "Safe Batch Transfer From",
              "description": "Safe Batch Transfer From"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function safeBatchTransferFrom(address _from, address _to, uint256[] _ids, uint256[] _values, bytes _data)",
              "inputFields": [
                {
                  "key": "_from",
                  "label": "From",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_to",
                  "label": "To",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_ids",
                  "label": "Ids",
                  "type": "string",
                  "placeholder": "",
                  "list": true,
                  "required": true
                },
                {
                  "key": "_values",
                  "label": "Values",
                  "type": "string",
                  "placeholder": "",
                  "list": true,
                  "required": true
                },
                {
                  "key": "_data",
                  "label": "Data",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "safeTransferFromAction",
            "name": "Safe Transfer From",
            "display": {
              "label": "Safe Transfer From",
              "description": "Safe Transfer From"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes _data)",
              "inputFields": [
                {
                  "key": "_from",
                  "label": "From",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_to",
                  "label": "To",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_value",
                  "label": "Value",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_data",
                  "label": "Data",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "setApprovalForAllAction",
            "name": "Set Approval For All",
            "display": {
              "label": "Set Approval For All",
              "description": "Set Approval For All"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function setApprovalForAll(address _operator, bool _approved)",
              "inputFields": [
                {
                  "key": "_operator",
                  "label": "Operator",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                },
                {
                  "key": "_approved",
                  "label": "Approved",
                  "type": "boolean",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "setContractURIAction",
            "name": "Set Contract URI",
            "display": {
              "label": "Set Contract URI",
              "description": "Set Contract URI"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function setContractURI(string contractURI)",
              "inputFields": [
                {
                  "key": "contractURI",
                  "label": "Contract URI",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "setTokenURIPrefixAction",
            "name": "Set Token URI Prefix",
            "display": {
              "label": "Set Token URI Prefix",
              "description": "Set Token URI Prefix"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function setTokenURIPrefix(string tokenURIPrefix)",
              "inputFields": [
                {
                  "key": "tokenURIPrefix",
                  "label": "Token URI Prefix",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "supportsInterfaceAction",
            "name": "Supports Interface (View function)",
            "display": {
              "label": "Supports Interface (View function)",
              "description": "Supports Interface (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function supportsInterface(bytes4 interfaceId) view returns bool",
              "inputFields": [
                {
                  "key": "interfaceId",
                  "label": "Interface Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Supports Interface",
                  "type": "boolean"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "symbolAction",
            "name": "Symbol (View function)",
            "display": {
              "label": "Symbol (View function)",
              "description": "Symbol (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function symbol() view returns string",
              "inputFields": [],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Symbol",
                  "type": "string"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "tokenURIPrefixAction",
            "name": "Token URI Prefix (View function)",
            "display": {
              "label": "Token URI Prefix (View function)",
              "description": "Token URI Prefix (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function tokenURIPrefix() view returns string",
              "inputFields": [],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Token URI Prefix",
                  "type": "string"
                }
              ],
              "sample": {}
            }
          },
          {
            "key": "transferOwnershipAction",
            "name": "Transfer Ownership",
            "display": {
              "label": "Transfer Ownership",
              "description": "Transfer Ownership"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function transferOwnership(address newOwner)",
              "inputFields": [
                {
                  "key": "newOwner",
                  "label": "New Owner",
                  "type": "address",
                  "placeholder": "Enter a blockchain address",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "uriAction",
            "name": "Uri (View function)",
            "display": {
              "label": "Uri (View function)",
              "description": "Uri (View function)"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function uri(uint256 _id) view returns string",
              "inputFields": [
                {
                  "key": "_id",
                  "label": "Id",
                  "type": "string",
                  "placeholder": "",
                  "list": false,
                  "required": true
                }
              ],
              "outputFields": [
                {
                  "key": "returnValue",
                  "label": "Return value of Uri",
                  "type": "string"
                }
              ],
              "sample": {}
            }
          }
        ],
        "icon": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAXlSURBVHgB1VpZSFtZGP5dum/a2nbaTtsrdKF0OmjbB/tQuPalfapxKLSlhUkcBhEG1Hma8WFMQFBEifFB0AfjAqI+mJk+uZKIiIJK4sCg4nbdcNzjvut8J4wlZozem5w70A/E5J57Lv93zv/9y7kh+sIRRCoiPT1duHDhgqarq8tBKiGQVMTx48dTl5eXjVqtNoRUgmoESktLE3d3d7WLi4sh+LOQSlCFAFxGmJycTNr7LkmS+OrVK5FUgCoErFYrW33B/drU1FQqqQDuBJhwV1dXkw4YEjUaTRJxBncCJ0+eNGL1Dxybn59P1ev1AnEEVwKZmZna7e1tjbfxhYWFkO7ubjNxBDcCdrs9JCgo6Eg/7+3tFaOiokTiBG4EWltbf/MUrjdsbm5yEzQXAv8KN1nBFPH9+/dcBM2FwPnz5607OzuK5oyOjhp5CNpvAky4WH2BFGJlZYXpxkh+wi8CLS0tghzhegN2QSMC5Af8IgDhfi9XuN6wtLTkl6B9JmCxWET805OfwAKIjx8/9lnQPhMYHx83I2kRD5w9e9bIIhn5AJ8IMOFChMJR901MTBBKafJWWuwBPQO1t7f7JOgAUgi4jjAwMGD15vtIUtTf3099fX20trZGg4ODLgKnT58mdGcUHBzs9dmhoaHR9fX1NlKAYFIIrGriQcYzw1EmuIxfX1/fN8ZyBMTqWukzZ854JcK6N5Ti0YCTZEJRT1xXVxczMjKS435tbm6OUKAxF3C5jKcunE7nPhfa2NhwuRUjHBAQQMeOHfs8hrlfNTc3rw8NDdlIJhS5UG5u7iAMENhnZmxPTw+h8zp0DnOhw8TOdoLtCIS8d8mJ+8MdDoesXZDtQtnZ2Vr4tDA9Pc1aRtZhEQ9sbW3RzMwM6xVcRKCVkKtXrzJB6+TMl7UDrMfNyMiwwn0EVgIowVE74AlkdpdO7t27F11dXW076n5ZYfTBgwcSfLb41KlTpDaY4C9dulT09u1bWWdJsvNAWVmZHlsdjsqzmIlPDWDlbQ8fPoxua2vTdXZ2ypojm0BJSYk5JiaGamtrtYgq4bdv3/6LOOHEiRPS/fv3YxB9olHbSWj+c1BnyToMk00AvmkKCwsbKCoqKjQajVRRUfENGvgfMSSRj2DJ7cqVK6a7d+9GInx+ev36dWJjY6MdvbMEApKcZ8jOA1VVVX+/ePFiHsnmF1YGv3z5cr6goKDw48ePf2A4FOE1gsV2T3jmgT1cvnzZ9uzZM01DQ0PxnTt3om7evGmBi2qhgfKmpqZfSSYUO3N+fr4Fich18hAYGCgh5MV++PDBgUZdQCy3IONGuN/vGYXg505oKBandbaIiIgQgD1PZGOY77x27VpkeXm5RDKhuJhDGNUhe86xz1gtAQnNnpOTY0bUINQxkVhZFr8lz3nYBScCgAH1Tjhc0AE/T4XvD+4ZzwLD8+fPY5UY75pHPgAGiFhVq/s1nETPnTt3zqTT6QxjY2NhCQkJP83Ozv6AHfgaArXeunUrDvqRsOoiiJjhisI+QwICDChH9KQQPsfDwsLCKhgY63kdYpfgzzFv3rz5Ewe6wtOnT79NS0v7lJSUJICYGZWseMDjpI6OjnDyAX4FdJPJZIdwIw4aA5EilB6GmpoaJ9wuETvGuq7/hEZEIuejR4+i8/LyfHoJoricdgc0wHbAfpBhMFgL49hRIyvOvMb069evG3w1nsGvpj45OVm6ePGi17NOFlYPMx45wIZ8kkN+wO9zobi4uJ9RI1mVzkNUktBLyKo4DwOXkzkkse9Q18vuohgg8mS52fYwcCEAV3JiF2SvJpKXKSUl5XfiAG6n0/Hx8cwg01H3YaekrKwsPXEC1xccCJ16ZGnJ2zhWnlD/6CIjIxW522HgSoC5ErJsrHuj7g40KgaUHTbiCO7vyFBKOFDkGTyv37hxo7GyslJPnKHKa1ZUp0bswufkxLLt8PCwllSAKgSQ3OZRPsTuVa1PnjzR4ZhEoi8N6B0079694/pW8n+H2WxW7YceDP8APjW7724QO2oAAAAASUVORK5CYII=",
        "user": "eip155:1:0x9C4De71cDbF4956c0Ab5c23d04912315865B7aA8"
      }
    }
    else if (actionName === 'aave') {
      action = {
        "key": "aave",
        "name": "AAVE",
        "version": "1.0.0",
        "platformVersion": "1.0.0",
        "type": "web3",
        "triggers": [
          {
            "key": "changeInHealthFactor",
            "name": "Change in Health Factor",
            "display": {
              "label": "Change in Health Factor",
              "description": "Change in Health Factor"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "healthFactorIsBelow",
                  "label": "Health Factor Is Below*",
                  "type": "string",
                  "placeholder": "0",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "actions": [
          {
            "key": "changeInHealthFactor",
            "name": "Change in Health Factor",
            "display": {
              "label": "Change in Health Factor",
              "description": "Change in Health Factor"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "healthFactorIsBelow",
                  "label": "Health Factor Is Below*",
                  "type": "string",
                  "placeholder": "0",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "icon": "https://cryptologos.cc/logos/aave-aave-logo.png?v=024",
        "user": "eip155:1:0x9C4De71cDbF4956c0Ab5c23d04912315865B7aA8"
      }
    }
    else if (actionName === 'smartVault') {
      action = {
        "key": "smartVault",
        "name": "Smart Vault",
        "version": "1.0.0",
        "platformVersion": "1.0.0",
        "type": "web3",
        "triggers": [
          {
            "key": "repay",
            "name": "Repay",
            "display": {
              "label": "Repay",
              "description": "Repay"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "yourCurrentSmartVaultBalance",
                  "label": "Your Current Smart Vault Balance",
                  "type": "string",
                  "placeholder": "Select Your Smart Vault Position",
                  "list": false,
                  "required": false
                },
                {
                  "key": "percentageOfYourDepositeUsedForEachTopUp",
                  "label": "Percentage of your deposit used for each top-up",
                  "type": "string",
                  "placeholder": "Enter the Percentage",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "topup",
            "name": "Top-up",
            "display": {
              "label": "topup",
              "description": "Top-up"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "yourCurrentSmartVaultBalance",
                  "label": "Your Current Smart Vault Balance",
                  "type": "string",
                  "placeholder": "Select Your Smart Vault Position",
                  "list": false,
                  "required": false
                },
                {
                  "key": "percentageOfYourDepositeUsedForEachTopUp",
                  "label": "Percentage of your deposit used for each top-up",
                  "type": "string",
                  "placeholder": "Enter the Percentage",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "actions": [
          {
            "key": "repay",
            "name": "Repay",
            "display": {
              "label": "Repay",
              "description": "Repay"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "yourCurrentSmartVaultBalance",
                  "label": "Your Current Smart Vault Balance",
                  "type": "string",
                  "placeholder": "Select Your Smart Vault Position",
                  "list": false,
                  "required": false
                },
                {
                  "key": "percentageOfYourDepositeUsedForEachTopUp",
                  "label": "Percentage of your deposit used for each top-up",
                  "type": "string",
                  "placeholder": "Enter the Percentage",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
          {
            "key": "topup",
            "name": "Top-up",
            "display": {
              "label": "topup",
              "description": "Top-up"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "yourCurrentSmartVaultBalance",
                  "label": "Your Current Smart Vault Balance",
                  "type": "string",
                  "placeholder": "Select Your Smart Vault Position",
                  "list": false,
                  "required": false
                },
                {
                  "key": "percentageOfYourDepositeUsedForEachTopUp",
                  "label": "Percentage of your deposit used for each top-up",
                  "type": "string",
                  "placeholder": "Enter the Percentage",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "icon": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAwADADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwB1FFdv4J0PT9SsLme8tlmZZQi7icAYB7fWuqTsrn5vg8LLFVVSg7M4iivYv+ET0L/oGxfmf8ar3fhPRDaSbdPjRtvDKSCPcc1HtUeu+HcR/Mvx/wAjyWitLV9In0i68twWib/VyY4Yf0PtWbWidzwqtKdKbhNWaCvSfhz/AMgi7/6+P/ZRXm1ek/Dn/kEXf/Xx/wCyioqbHq5F/vi9GXfF+v3GiWsAtVUzTMQHcZCgYzx680nhDxBPrdtcLdKglgYAsgwGBzjj14p/jNI5NCZPsj3MzMBCEQsUb+9x0wKTwYiR6Gsf2N7adWImDoVLt2bnrkVlpyn0fNW/tHl5/dte39feUviLxpFp/wBfH/srV5rXpPxG/wCQRaf9fH/srV5tWtP4T5zPf98fogrt/BGuafpthcwXlysLNKHXcDgjAHb6VxFFVJXVjgweKlhaqqwV2exf8JZoX/QSh/X/AAo/4SzQv+glD+v+FeO0VHskev8A6x1/5F+P+Z2/jbXNO1LT7aCzuVmdZd7bQcAYI7/WuIooq4qyseRjMVLFVXVmrM//2Q==",
        "user": "eip155:1:0x9C4De71cDbF4956c0Ab5c23d04912315865B7aA8"
      }
    }
    else if (actionName === '1inch'){
      action = {
        "key": "1inch",
        "name": "1Inch",
        "version": "1.0.0",
        "platformVersion": "1.0.0",
        "type": "web3",
        "triggers": [
          {
            "key": "priceIsBelow",
            "name": "Price is Below",
            "display": {
              "label": "Price is Below",
              "description": "Price is Below"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "priceIsBelow",
                  "label": "Price Is Below*",
                  "type": "string",
                  "placeholder": "0",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "actions": [
          {
            "key": "priceIsBelow",
            "name": "Price is Below",
            "display": {
              "label": "Price is Below",
              "description": "Price is Below"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "priceIsBelow",
                  "label": "Price Is Below*",
                  "type": "string",
                  "placeholder": "0",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "icon": "https://cryptologos.cc/logos/1inch-1inch-logo.png?v=024",
        "user": "eip155:1:0x9C4De71cDbF4956c0Ab5c23d04912315865B7aA8"
      }
    }
    else if (actionName === 'uniswap'){
      action = {
        "key": "uniswap",
        "name": "Uniswap V3",
        "version": "1.0.0",
        "platformVersion": "1.0.0",
        "type": "web3",
        "triggers": [
          {
            "key": "lpOutOfRange",
            "name": "LP out of range ",
            "display": {
              "label": "LP out of range ",
              "description": "LP out of range "
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "healthFactorIsBelow",
                  "label": "Health Factor is below*",
                  "type": "string",
                  "placeholder": "0",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "actions": [
          {
            "key": "healthFactorIsBelow",
            "name": "Health Factor is below",
            "display": {
              "label": "Health Factor is below",
              "description": "Health Factor is below"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "healthFactorIsBelow",
                  "label": "Health Factor is below*",
                  "type": "string",
                  "placeholder": "0",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "icon": "https://cryptologos.cc/logos/uniswap-uni-logo.png?v=024",
        "user": "eip155:1:0x9C4De71cDbF4956c0Ab5c23d04912315865B7aA8"
      }
    }
    else if (actionName === 'curve'){
      action = {
        "key": "curve",
        "name": "Curve",
        "version": "1.0.0",
        "platformVersion": "1.0.0",
        "type": "web3",
        "triggers": [
          {
            "key": "poolImbalanceRatio",
            "name": "Pool Imbalance Ratio",
            "display": {
              "label": "Pool Imbalance Ratio",
              "description": "Pool Imbalance Ratio "
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "ratio",
                  "label": "Ratio*",
                  "type": "string",
                  "placeholder": "0",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "actions": [
          {
            "key": "healthFactorIsBelow",
            "name": "Health Factor is below",
            "display": {
              "label": "Health Factor is below",
              "description": "Health Factor is below"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "healthFactorIsBelow",
                  "label": "Health Factor is below*",
                  "type": "string",
                  "placeholder": "0",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "icon": "https://cryptologos.cc/logos/curve-dao-token-crv-logo.png?v=024",
        "user": "eip155:1:0x9C4De71cDbF4956c0Ab5c23d04912315865B7aA8"
      }
    }
    else if (actionName === 'telegram'){
      action = {
        "key": "telegram",
        "name": "Telegram",
        "version": "1.0.0",
        "platformVersion": "1.0.0",
        "type": "web3",
        "triggers": [],
        "actions": [
          {
            "key": "subscribe",
            "name": "Subscribe",
            "display": {
              "label": "Subscribe",
              "description": "Subscribe"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "username",
                  "label": "Username. Please also /startsubscribe in telegram bot*",
                  "type": "string",
                  "placeholder": "username",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "icon": "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMzdhZWUyIiBoZWlnaHQ9IjUxMiIgcng9IjE1JSIgd2lkdGg9IjUxMiIvPjxwYXRoIGQ9Im0xOTkgNDA0Yy0xMSAwLTEwLTQtMTMtMTRsLTMyLTEwNSAyNDUtMTQ0IiBmaWxsPSIjYzhkYWVhIi8+PHBhdGggZD0ibTE5OSA0MDRjNyAwIDExLTQgMTYtOGw0NS00My01Ni0zNCIgZmlsbD0iI2E5YzlkZCIvPjxwYXRoIGQ9Im0yMDQgMzE5IDEzNSA5OWMxNCA5IDI2IDQgMzAtMTRsNTUtMjU4YzUtMjItOS0zMi0yNC0yNWwtMzIxIDEyNGMtMjEgOC0yMSAyMS00IDI2bDgzIDI2IDE5MC0xMjFjOS01IDE3LTMgMTEgNCIgZmlsbD0iI2Y2ZmJmZSIvPjwvc3ZnPg==",
        "user": "eip155:1:0x9C4De71cDbF4956c0Ab5c23d04912315865B7aA8"
      }
    }
    else if (actionName === 'email'){
      action = {
        "key": "email",
        "name": "Email",
        "version": "1.0.0",
        "platformVersion": "1.0.0",
        "type": "web3",
        "triggers": [],
        "actions": [
          {
            "key": "sendEmail",
            "name": "Send Email",
            "display": {
              "label": "Send Email",
              "description": "Send Email"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "toList",
                  "label": "Recieve List",
                  "type": "string",
                  "placeholder": "split with comma",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "icon": "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIj48cmVjdCBoZWlnaHQ9IjE0IiByeD0iMSIgd2lkdGg9IjE4IiB4PSIzIiB5PSI1Ii8+PHBhdGggZD0ibTIwIDUuNS04IDcuNS04LTcuNSIvPjwvZz48L3N2Zz4=",
        "user": "eip155:1:0x9C4De71cDbF4956c0Ab5c23d04912315865B7aA8"
      }
    }
    else if (actionName === 'discord'){
      action = {
        "key": "discord",
        "name": "Discord",
        "version": "1.0.0",
        "platformVersion": "1.0.0",
        "type": "web3",
        "triggers": [],
        "actions": [
          {
            "key": "userId",
            "name": "Discord ID",
            "display": {
              "label": "Discord User ID",
              "description": "Discord User ID"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "userId",
                  "label": "Discord User ID",
                  "type": "string",
                  "placeholder": "User Id",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "icon": "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjNzI4OWRhIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBoZWlnaHQ9IjUxMiIgcng9IjE1JSIgd2lkdGg9IjUxMiIvPjxwYXRoIGQ9Im0zNDYgMzkyLTIxLTI1YzQxLTExIDU3LTM5IDU3LTM5LTUyIDQ5LTE5NCA1MS0yNDkgMCAwIDAgMTQgMjYgNTYgMzlsLTIzIDI1Yy03MC0xLTk3LTQ4LTk3LTQ4IDAtMTA0IDQ2LTE4NyA0Ni0xODcgNDctMzMgOTAtMzMgOTAtMzNsMyA0Yy01OCAxNi04MyA0Mi04MyA0MiA2OC00NiAyMDgtNDIgMjYzIDAgMS0xLTMzLTI4LTg2LTQybDUtNHM0MyAwIDkwIDMzYzAgMCA0NiA4MyA0NiAxODcgMCAwLTI3IDQ3LTk3IDQ4eiIgZmlsbD0iI2ZmZiIvPjxlbGxpcHNlIGN4PSIxOTYiIGN5PSIyNzkiIHJ4PSIzMyIgcnk9IjM1Ii8+PGVsbGlwc2UgY3g9IjMxMiIgY3k9IjI3OSIgcng9IjMzIiByeT0iMzUiLz48L3N2Zz4=",
        "user": "eip155:1:0x9C4De71cDbF4956c0Ab5c23d04912315865B7aA8"
      }
    }
    else if(actionName === 'notify'){
      action = {
        "key": "notify",
        "name": "Notify",
        "version": "1.0.0",
        "platformVersion": "1.0.0",
        "type": "web3",
        "triggers": [
          {
            "key": "condition",
            "name": "liquidation",
            "display": {
              "label": "Liquidation",
              "description": "Liquidation"
            },
            "operation": {
              "type": "blockchain:call",
              "signature": "function addSigner(address account)",
              "inputFields": [
                {
                  "key": "borrowLimitOver",
                  "label": "Your Position Over",
                  "type": "integer",
                  "placeholder": "Enter the Percentage i.e. 50",
                  "list": false,
                  "required": false
                }
              ],
              "outputFields": [],
              "sample": {}
            }
          },
        ],
        "actions": [],
        "icon": "data:image/png;base64,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",
        "user": "eip155:1:0x9C4De71cDbF4956c0Ab5c23d04912315865B7aA8"
      }
    }
    return action
  }

  // const getConnector = async (key: string) => {
  const getConnector = (key: string) => {
    console.log(`getConnector`,key)
    const res = getConnectoAction(key)
    console.log(res)
    // const res = await client?.getDriver(
    //   key,
    //   isLocalOrStaging ? "staging" : undefined,
    //   false
    // );

    if (res) {
      setConnector(res);
    } else {
      setConnector(null);
      setSavedCredentials([]);
    }
  };

  const listCredentials = async () => {
    const res = await client?.listAuthCredentials(
      connector?.key || "",
      isLocalOrStaging ? "staging" : "production"
    );
    if (res) {
      setSavedCredentials(res);
    } else {
      setSavedCredentials([]);
    }
  };

  useEffect(() => {
    setOperation(
      type === "trigger"
        ? connector?.triggers?.find(
          (trigger) => trigger.key === workflow.trigger.operation
        )
        : connector?.actions?.find(
          (action) => action.key === workflow.actions[index].operation
        )
    );
  }, [connector, type, workflow]);

  useEffect(() => {
    passOutputFields();
  }, [passOutputFields]);

  useEffect(() => {
    if (type === "trigger") {
      updateWorkflow({
        "system.trigger.selected": operation ? true : false,
        "system.trigger.authenticated": operationIsAuthenticated ? true : false,
        "system.trigger.configured": operationIsConfigured ? true : false,
        "system.trigger.tested": true,
      });
    } else {
      updateWorkflow({
        ["system.actions[" + index + "].selected"]: operation ? true : false,
        ["system.actions[" + index + "].authenticated"]:
          operationIsAuthenticated ? true : false,
        ["system.actions[" + index + "].configured"]: operationIsConfigured
          ? true
          : false,
        ["system.actions[" + index + "].tested"]: operationIsTested
          ? true
          : false,
      });
    }
  }, [
    operation,
    operationIsAuthenticated,
    operationIsConfigured,
    operationIsTested,
    key,
  ]);

  useEffect(() => {
    if (operationAuthenticationIsRequired) {
      listCredentials();
    }
  }, [connector?.key, operationAuthenticationIsRequired]);

  return (
    <WorkflowStepContext.Provider
      value={{
        type,
        index,
        step,
        activeRow,
        username,
        connector,
        operation,
        operationIsConfigured,
        operationIsAuthenticated,
        operationAuthenticationIsRequired,
        inputError,
        errors,
        operationIsTested,
        savedCredentials,
        setConnector,
        setActiveRow,
        setUsername,
        getConnector,
        setInputError,
        setErrors,
        setOperationIsTested,
        setSavedCredentials,
      }}
    >
      {children}
    </WorkflowStepContext.Provider>
  );
};

export default WorkflowStepContextProvider;
