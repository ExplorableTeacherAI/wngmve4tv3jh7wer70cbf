import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableParagraph,
    InlineSpotColor,
    InlineTooltip,
} from "@/components/atoms";
import { getVariableInfo, spotColorPropsFromDefinition } from "../variables";

export const matricesIntroBlocks: ReactElement[] = [
    <StackLayout key="layout-matrices-intro-title" maxWidth="xl">
        <Block id="matrices-intro-title" padding="md">
            <EditableH1 id="h1-matrices-intro-title" blockId="matrices-intro-title">
                Matrix Multiplication
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-matrices-intro-hook" maxWidth="xl">
        <Block id="matrices-intro-hook" padding="sm">
            <EditableParagraph id="para-matrices-intro-hook" blockId="matrices-intro-hook">
                The smoothie bar at your school runs on two small{" "}
                <InlineTooltip
                    id="tooltip-intro-matrix"
                    tooltip="A matrix is a rectangular grid of numbers written inside square brackets, read row by row."
                >
                    tables of numbers
                </InlineTooltip>
                . One holds the{" "}
                <InlineSpotColor
                    varName="rowAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('rowAccent'))}
                >
                    scoops of fruit, yoghurt and honey
                </InlineSpotColor>
                {" "}in each drink, the other the{" "}
                <InlineSpotColor
                    varName="columnAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('columnAccent'))}
                >
                    price of every ingredient
                </InlineSpotColor>
                , and folding the two together in one move is exactly what matrix multiplication is for.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-matrices-intro-promise" maxWidth="xl">
        <Block id="matrices-intro-promise" padding="sm">
            <EditableParagraph id="para-matrices-intro-promise" blockId="matrices-intro-promise">
                You can already read a matrix by its rows and columns, name its size, and add two
                matrices that match. That is everything you need to start. By the end you will be able
                to multiply two matrices and say why their sizes have to fit, measure what a matrix does
                to a shape with its{" "}
                <InlineSpotColor
                    varName="areaAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('areaAccent'))}
                >
                    determinant
                </InlineSpotColor>
                , and find the matrix that undoes it.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
