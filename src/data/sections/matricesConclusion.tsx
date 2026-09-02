import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineSpotColor } from "@/components/atoms";
import { getVariableInfo, spotColorPropsFromDefinition } from "../variables";

export const matricesConclusionBlocks: ReactElement[] = [
    <StackLayout key="layout-wrapping-up-heading" maxWidth="xl">
        <Block id="wrapping-up-heading" padding="md">
            <EditableH2 id="h2-wrapping-up-heading" blockId="wrapping-up-heading">
                Summary of Key Results
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapping-up-thread" maxWidth="xl">
        <Block id="wrapping-up-thread" padding="sm">
            <EditableParagraph id="para-wrapping-up-thread" blockId="wrapping-up-thread">
                So matrix multiplication was never about matching positions. Every entry of the answer is
                one{" "}
                <InlineSpotColor
                    varName="rowAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('rowAccent'))}
                >
                    row
                </InlineSpotColor>
                {" "}meeting one{" "}
                <InlineSpotColor
                    varName="columnAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('columnAccent'))}
                >
                    column
                </InlineSpotColor>
                , multiplied and added, and that single rule explains why the sizes must fit, why the
                answer comes out the size it does, and why swapping the order gives you something
                different.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapping-up-next" maxWidth="xl">
        <Block id="wrapping-up-next" padding="sm">
            <EditableParagraph id="para-wrapping-up-next" blockId="wrapping-up-next">
                The{" "}
                <InlineSpotColor
                    varName="areaAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('areaAccent'))}
                >
                    determinant
                </InlineSpotColor>
                {" "}then told you what a two by two matrix does to area, and the inverse gave
                you the way back, unless that area had already been crushed to zero. These three ideas
                are how graphics software turns a character, how a phone straightens a crooked photo, and
                how engineers handle dozens of equations at once. That last one is where you are heading
                next: solving whole systems of equations in a single move.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
