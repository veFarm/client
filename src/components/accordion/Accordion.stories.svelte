<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Accordion } from ".";
</script>

<Meta title="components/Accordion" component={Accordion} />

<Story name="Default">
  <div>
    <Accordion title="How does it work?">
      <svelte:fragment slot="body">
        <p>
          Vearn will periodically exchange VTHO for VET while keeping a balance of
          15 VTHO in your account.
        </p>
        <p>
          Vearn will periodically exchange VTHO for VET while keeping a balance of
          15 VTHO in your account.
        </p>
      </svelte:fragment>
    </Accordion>
  </div>
</Story>
